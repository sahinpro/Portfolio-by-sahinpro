/**
 * Admin API: website revalidation relay (audit §11).
 *
 * Covers the two invariants of `resolveWebsiteRevalidateConfig()` +
 * `revalidateWebsiteCache()`:
 *  - the destination comes ONLY from `WEBSITE_URL`, must be https-or-loopback
 *    on the fixed allowlist, and is always hit at `{origin}/api/revalidate`
 *    with the server-only `x-revalidate-token`;
 *  - every config/upstream failure surfaces as the established 503
 *    `{ ok: false, revalidationFailed: true, reason }` (and the legacy
 *    `/api/admin/flush-cache` alias keeps its `{ flushed: false, … }` shape).
 *
 * All requests carry a verified allowlisted bearer token (harness stub), so
 * what is under test is the relay, never the auth gate.
 */
import { ALL_CACHE_TAGS } from "@sahinpro/shared/revalidate";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import {
  AUTHORIZED_ENV,
  authOkRoute,
  installFetchStub,
  isWebsiteRelay,
  withEnv,
} from "./harness";

const RELAY_ENV = {
  ...AUTHORIZED_ENV,
  REVALIDATE_SECRET: "relay-secret",
  WEBSITE_URL: "https://www.sahinpro.me",
};

const ADMIN_HEADERS = {
  "Content-Type": "application/json",
  Authorization: "Bearer admin-token",
};

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

function post(path: string, body: unknown = {}) {
  return api.request(path, {
    method: "POST",
    headers: ADMIN_HEADERS,
    body: JSON.stringify(body),
  });
}

describe("admin api: website revalidate relay", () => {
  it("relays to the fixed website destination with the server-only token", async () => {
    stub = installFetchStub([
      authOkRoute,
      {
        match: isWebsiteRelay,
        json: { flushed: true, publishedProjectCount: 3 },
      },
    ]);
    await withEnv(RELAY_ENV, async () => {
      const res = await post("/api/_revalidate");
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        ok: true,
        publishedProjectCount: 3,
      });

      const relay = stub!.find((call) => isWebsiteRelay(call.url));
      assert.ok(relay, "expected a relay POST to the website");
      assert.equal(relay!.url, "https://www.sahinpro.me/api/revalidate");
      assert.equal(relay!.method, "POST");
      assert.equal(relay!.headers["x-revalidate-token"], "relay-secret");
      assert.deepEqual(JSON.parse(relay!.body!), { tags: [...ALL_CACHE_TAGS] });
    });
  });

  it("keeps the legacy /api/admin/flush-cache alias response shape", async () => {
    stub = installFetchStub([
      authOkRoute,
      {
        match: isWebsiteRelay,
        json: { flushed: true, publishedProjectCount: 1 },
      },
    ]);
    await withEnv(RELAY_ENV, async () => {
      const res = await post("/api/admin/flush-cache", { tags: ["projects"] });
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), {
        flushed: true,
        publishedProjectCount: 1,
      });

      const relay = stub!.find((call) => isWebsiteRelay(call.url));
      assert.deepEqual(JSON.parse(relay!.body!), { tags: ["projects"] });
    });
  });

  it("answers 400 for malformed tags before relaying anything", async () => {
    stub = installFetchStub([authOkRoute]);
    await withEnv(RELAY_ENV, async () => {
      const res = await post("/api/_revalidate", { tags: [42] });
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: "Invalid tags" });
      assert.equal(stub!.filter((c) => isWebsiteRelay(c.url)).length, 0);
    });
  });

  const configCases: Array<{
    name: string;
    env: Record<string, string | undefined>;
    reason: string;
  }> = [
    {
      name: "REVALIDATE_SECRET unset",
      env: { REVALIDATE_SECRET: undefined },
      reason: "missing_revalidate_secret",
    },
    {
      name: "WEBSITE_URL unset (no default exists)",
      env: { WEBSITE_URL: undefined },
      reason: "missing_website_url",
    },
    {
      name: "WEBSITE_URL is not a URL",
      env: { WEBSITE_URL: "not a url" },
      reason: "invalid_website_url",
    },
    {
      name: "WEBSITE_URL points off the allowlist (SSRF guard)",
      env: { WEBSITE_URL: "https://attacker.example.com" },
      reason: "origin_not_allowlisted",
    },
  ];

  for (const testCase of configCases) {
    it(`503 ${testCase.reason} when ${testCase.name}`, async () => {
      stub = installFetchStub([authOkRoute]);
      await withEnv({ ...RELAY_ENV, ...testCase.env }, async () => {
        const res = await post("/api/_revalidate");
        assert.equal(res.status, 503);
        assert.deepEqual(await res.json(), {
          ok: false,
          revalidationFailed: true,
          reason: testCase.reason,
        });
        // Rejected before any network call to the (invalid) destination.
        assert.equal(stub!.filter((c) => isWebsiteRelay(c.url)).length, 0);
      });
    });
  }

  it("503 upstream_error when the website answers non-2xx", async () => {
    stub = installFetchStub([
      authOkRoute,
      { match: isWebsiteRelay, status: 401, json: { error: "Unauthorized" } },
    ]);
    await withEnv(RELAY_ENV, async () => {
      const res = await post("/api/_revalidate");
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), {
        ok: false,
        revalidationFailed: true,
        reason: "upstream_error",
      });
    });
  });

  it("503 upstream_unreachable when the relay fetch throws", async () => {
    stub = installFetchStub([
      authOkRoute,
      { match: isWebsiteRelay, throwError: true },
    ]);
    await withEnv(RELAY_ENV, async () => {
      const res = await post("/api/admin/flush-cache");
      assert.equal(res.status, 503);
      assert.deepEqual(await res.json(), {
        flushed: false,
        revalidationFailed: true,
        reason: "upstream_unreachable",
      });
    });
  });

  it("accepts the loopback dev origins on the allowlist", async () => {
    stub = installFetchStub([
      authOkRoute,
      { match: isWebsiteRelay, json: { flushed: true } },
    ]);
    await withEnv(
      { ...RELAY_ENV, WEBSITE_URL: "http://localhost:3000" },
      async () => {
        const res = await post("/api/_revalidate");
        assert.equal(res.status, 200);
        const relay = stub!.find((call) => isWebsiteRelay(call.url));
        assert.equal(relay!.url, "http://localhost:3000/api/revalidate");
      },
    );
  });
});
