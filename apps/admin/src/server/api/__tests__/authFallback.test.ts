/**
 * Admin API: 405/404 fallback + bearer authentication.
 *
 * Same restored pre-split contract as the Website app (see
 * `src/server/api/app.ts`), plus the fail-closed admin check: every
 * `/api/_revalidate` / `/api/admin/flush-cache` call must carry a Supabase
 * bearer token belonging to the `NEXT_PUBLIC_ADMIN_EMAIL` allowlist, or the
 * route answers the established 401 `{ error: "Unauthorized" }` — including
 * when Supabase env is missing entirely (no network attempted).
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import {
  AUTHORIZED_ENV,
  authOkRoute,
  installFetchStub,
  withEnv,
} from "./harness";

const jsonHeaders = { "Content-Type": "application/json" };

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("admin api: 405/404 fallback", () => {
  it("answers 404 for an unknown endpoint", async () => {
    const res = await api.request("/api/nope", { method: "GET" });
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "Not Found" });
  });

  it("answers 405 + Allow for a known endpoint with an unregistered verb", async () => {
    const res = await api.request("/api/_revalidate", { method: "GET" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "POST");
  });

  it("answers 405 for writes on the legacy flush alias too", async () => {
    const res = await api.request("/api/admin/flush-cache", {
      method: "DELETE",
    });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "POST");
  });
});

describe("admin api: bearer authentication", () => {
  it("rejects a request with no Authorization header (401, no network)", async () => {
    stub = installFetchStub([authOkRoute]);
    await withEnv(AUTHORIZED_ENV, async () => {
      const res = await api.request("/api/_revalidate", {
        method: "POST",
        headers: jsonHeaders,
        body: "{}",
      });
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "Unauthorized" });
      assert.equal(stub!.length, 0);
    });
  });

  it("fails closed when Supabase env is unconfigured (401, no network)", async () => {
    stub = installFetchStub([]);
    await withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
      },
      async () => {
        const res = await api.request("/api/_revalidate", {
          method: "POST",
          headers: { ...jsonHeaders, Authorization: "Bearer some-token" },
          body: "{}",
        });
        assert.equal(res.status, 401);
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("rejects a token whose user is outside the admin allowlist (401)", async () => {
    stub = installFetchStub([
      {
        // Same verification path, but a non-allowlisted email.
        match: authOkRoute.match,
        json: {
          id: "u2",
          aud: "authenticated",
          role: "authenticated",
          email: "eve@example.com",
        },
      },
    ]);
    await withEnv(AUTHORIZED_ENV, async () => {
      const res = await api.request("/api/_revalidate", {
        method: "POST",
        headers: { ...jsonHeaders, Authorization: "Bearer eve-token" },
        body: "{}",
      });
      assert.equal(res.status, 401);
      // The token WAS verified — just not authorized.
      assert.equal(stub!.length, 1);
    });
  });

  it("passes an allowlisted admin token through to the route", async () => {
    // Authorized, but relay env missing → route-level 503 (proves middleware
    // let the request through; config handling is covered in relay.test.ts).
    stub = installFetchStub([authOkRoute]);
    await withEnv(
      {
        ...AUTHORIZED_ENV,
        REVALIDATE_SECRET: undefined,
        WEBSITE_URL: undefined,
      },
      async () => {
        const res = await api.request("/api/_revalidate", {
          method: "POST",
          headers: { ...jsonHeaders, Authorization: "Bearer admin-token" },
          body: "{}",
        });
        assert.equal(res.status, 503);
        assert.deepEqual(await res.json(), {
          ok: false,
          revalidationFailed: true,
          reason: "missing_revalidate_secret",
        });
      },
    );
  });
});
