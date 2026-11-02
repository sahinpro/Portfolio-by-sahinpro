/**
 * Workspace API: 405/404 fallback + authorization rejections.
 *
 * Fallback: the same restored pre-split contract as the other two apps.
 * Auth: outreach admin routes reject every unverified bearer (missing header,
 * unauthenticated token, Supabase env unconfigured) with the established 401
 * before any handler-side service call happens, and the cron tick enforces
 * the CRON_SECRET bearer/header contract fail-closed.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import { installFetchStub, SERVICE_ENV, withEnv } from "./harness";

/**
 * The service-role client caches on its FIRST call for the whole process.
 * Every rejection test below must therefore run with `SUPABASE_SERVICE_ROLE_KEY`
 * explicitly absent (the repo `.env` is auto-loaded by `bun test`), so none of
 * them can seed the cache with a real project URL before cronRun.test.ts does.
 */
const NO_SERVICE_KEY = { SUPABASE_SERVICE_ROLE_KEY: undefined };

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("workspace api: 405/404 fallback", () => {
  it("answers 404 for an unknown endpoint", async () => {
    const res = await api.request("/api/not-a-route", { method: "GET" });
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "Not Found" });
  });

  it("answers 405 for a POST to the GET-only cron endpoint", async () => {
    const res = await api.request("/api/cron/outreach-windows", {
      method: "POST",
    });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET");
  });

  it("lists both verbs for the schedule endpoint (GET + PUT)", async () => {
    const res = await api.request("/api/admin/outreach-schedule", {
      method: "DELETE",
    });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET, PUT");
  });
});

describe("workspace api: outreach admin bearer gate", () => {
  it("rejects requests with no Authorization header (401, no network)", async () => {
    stub = installFetchStub([]);
    await withEnv({ ...SERVICE_ENV, ...NO_SERVICE_KEY }, async () => {
      const res = await api.request("/api/admin/outreach-schedule", {
        method: "GET",
      });
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "Unauthorized" });
      assert.equal(stub!.length, 0);
    });
  });

  it("rejects a token Supabase does not recognize (401)", async () => {
    stub = installFetchStub([
      {
        // adminAuth creates a per-call client on NEXT_PUBLIC_SUPABASE_URL and
        // hits GET /auth/v1/user — answer it as GoTrue would for a bad token.
        match: (url) => url.includes("/auth/v1/user"),
        status: 401,
        json: {
          code: "invalid_token",
          error_code: "invalid_token",
          msg: "Invalid JWT",
        },
      },
    ]);
    await withEnv(
      {
        ...SERVICE_ENV,
        ...NO_SERVICE_KEY,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "sb_publishable_test",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      },
      async () => {
        const res = await api.request("/api/admin/outreach-schedule", {
          method: "GET",
          headers: { Authorization: "Bearer forged-token" },
        });
        assert.equal(res.status, 401);
        // The token was verified (one auth call) — and rejected. Never any
        // handler-side service call.
        assert.equal(
          stub!.filter((c) => c.url.includes("/rest/v1/")).length,
          0,
        );
      },
    );
  });

  it("fails closed when Supabase env is unconfigured (401, no network)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        ...NO_SERVICE_KEY,
      },
      async () => {
        const res = await api.request("/api/admin/outreach-planner-zones", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer any-token",
          },
          body: "{}",
        });
        assert.equal(res.status, 401);
        assert.equal(stub!.length, 0);
      },
    );
  });
});

describe("workspace api: cron secret gate", () => {
  const CRON_PATH = "/api/cron/outreach-windows";

  it("denies when CRON_SECRET is not configured, even with a bearer (401)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { CRON_SECRET: undefined, ...SERVICE_ENV, ...NO_SERVICE_KEY },
      async () => {
        const res = await api.request(CRON_PATH, {
          method: "GET",
          headers: { Authorization: "Bearer anything" },
        });
        assert.equal(res.status, 401);
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("denies a missing secret (401)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { CRON_SECRET: "right-secret", ...NO_SERVICE_KEY },
      async () => {
        const res = await api.request(CRON_PATH, { method: "GET" });
        assert.equal(res.status, 401);
      },
    );
  });

  it("denies a wrong secret on either accepted header (401)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { CRON_SECRET: "right-secret", ...NO_SERVICE_KEY },
      async () => {
        const viaBearer = await api.request(CRON_PATH, {
          method: "GET",
          headers: { Authorization: "Bearer wrong-secret" },
        });
        const viaHeader = await api.request(CRON_PATH, {
          method: "GET",
          headers: { "x-cron-secret": "wrong-secret" },
        });
        assert.equal(viaBearer.status, 401);
        assert.equal(viaHeader.status, 401);
      },
    );
  });
});
