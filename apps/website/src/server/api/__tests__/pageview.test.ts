/**
 * POST /api/pageview — the established always-204 contract: analytics
 * ingestion must never change the response, whether the edge function is
 * configured, reachable, or erroring.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import {
  installFetchStub,
  isSupabaseFunctions,
  nextTestIp,
  withEnv,
} from "./harness";

const CLEAN_ANALYTICS_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: undefined,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined,
  ANALYTICS_INGEST_SECRET: undefined,
  NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: undefined,
};

function postPageview(body: string) {
  return api.request("/api/pageview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": nextTestIp(),
    },
    body,
  });
}

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("website api: pageview", () => {
  it("answers 204 without calling any service when analytics is unconfigured", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_ANALYTICS_ENV, async () => {
      const res = await postPageview(JSON.stringify({ path: "/projects" }));
      assert.equal(res.status, 204);
      assert.equal(await res.text(), "");
      assert.equal(stub!.length, 0);
    });
  });

  it("forwards path, referrer and secret when configured — still 204", async () => {
    stub = installFetchStub([
      { match: isSupabaseFunctions, status: 500, json: { error: "boom" } },
    ]);
    await withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: "sb_publishable_test",
        ANALYTICS_INGEST_SECRET: "ingest-secret",
      },
      async () => {
        const res = await api.request("/api/pageview", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            referer: "https://sahinpro.me/",
            "user-agent": "TestAgent/1.0",
          },
          body: JSON.stringify({ path: "/services" }),
        });
        assert.equal(res.status, 204);

        const call = stub!.find((c) => isSupabaseFunctions(c.url));
        assert.ok(call, "expected a forward to record-page-view");
        assert.match(call!.url, /\/functions\/v1\/record-page-view$/);
        assert.equal(call!.headers["x-analytics-secret"], "ingest-secret");
        assert.equal(call!.headers.authorization, "Bearer sb_publishable_test");
        const payload = JSON.parse(call!.body!) as Record<string, unknown>;
        assert.equal(payload.path, "/services");
        assert.equal(payload.referrer, "https://sahinpro.me/");
        assert.equal(payload.userAgent, "TestAgent/1.0");
      },
    );
  });

  it("answers 204 even when the upstream fetch throws", async () => {
    // No stub route matches → the stubbed fetch itself rejects.
    stub = installFetchStub([]);
    await withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-test",
        NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: "ingest-secret",
      },
      async () => {
        const res = await postPageview(JSON.stringify({ path: "/" }));
        assert.equal(res.status, 204);
      },
    );
  });

  it("answers 204 for a malformed body", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_ANALYTICS_ENV, async () => {
      const res = await postPageview("<<not json>>");
      assert.equal(res.status, 204);
    });
  });
});
