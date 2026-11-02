/**
 * POST /api/revalidate — secret authorization + body contract.
 *
 * The accepted-secret list (server REVALIDATE_SECRET, the two public ingest
 * names and the legacy VITE_ name) and the `{ flushed: true, tags,
 * publishedProjectCount }` response are ported unchanged from the pre-Hono
 * handler. Supabase reads run against the fetch stub (the shared client
 * falls back to `https://invalid.supabase.co`), so the flush path is fully
 * exercised without touching production.
 */
import { ALL_CACHE_TAGS } from "@sahinpro/shared/revalidate";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import { defaultStubRoutes, installFetchStub, withEnv } from "./harness";

const NO_SECRETS = {
  REVALIDATE_SECRET: undefined,
  NEXT_PUBLIC_REVALIDATE_SECRET: undefined,
  NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: undefined,
  VITE_ANALYTICS_INGEST_SECRET: undefined,
  UPSTASH_REDIS_REST_URL: undefined,
  UPSTASH_REDIS_REST_TOKEN: undefined,
};

function postRevalidate(token?: string, body?: unknown) {
  return api.request("/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token === undefined ? {} : { "x-revalidate-token": token }),
    },
    body: body === undefined ? "{}" : JSON.stringify(body),
  });
}

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("website api: revalidate", () => {
  it("rejects a request without a token (401)", async () => {
    stub = installFetchStub([]);
    await withEnv(NO_SECRETS, async () => {
      const res = await postRevalidate();
      assert.equal(res.status, 401);
      assert.deepEqual(await res.json(), { error: "Unauthorized" });
      assert.equal(stub!.length, 0);
    });
  });

  it("rejects an invalid token (401) even when a secret is configured", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { ...NO_SECRETS, REVALIDATE_SECRET: "right-secret" },
      async () => {
        const res = await postRevalidate("wrong-secret");
        assert.equal(res.status, 401);
        assert.equal(stub!.length, 0);
      },
    );
  });

  it("rejects every token while no secret is configured (fail-closed)", async () => {
    stub = installFetchStub([]);
    await withEnv(NO_SECRETS, async () => {
      const res = await postRevalidate("any-token");
      assert.equal(res.status, 401);
    });
  });

  it("accepts the legacy public ingest secret", async () => {
    stub = installFetchStub(defaultStubRoutes());
    await withEnv(
      { ...NO_SECRETS, NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: "legacy-secret" },
      async () => {
        const res = await postRevalidate("legacy-secret");
        assert.equal(res.status, 200);
      },
    );
  });

  it("rejects malformed tags with 400 after authorization", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { ...NO_SECRETS, REVALIDATE_SECRET: "right-secret" },
      async () => {
        const res = await postRevalidate("right-secret", {
          tags: ["projects", 42],
        });
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: "Invalid tags" });
      },
    );
  });

  it("flushes all tags by default and reports the verified project count", async () => {
    stub = installFetchStub(defaultStubRoutes());
    await withEnv(
      { ...NO_SECRETS, REVALIDATE_SECRET: "right-secret" },
      async () => {
        const res = await postRevalidate("right-secret", {});
        assert.equal(res.status, 200);
        const payload = (await res.json()) as {
          flushed: boolean;
          tags: string[];
          publishedProjectCount: number;
        };
        assert.equal(payload.flushed, true);
        assert.deepEqual(payload.tags, [...ALL_CACHE_TAGS]);
        assert.equal(payload.publishedProjectCount, 0); // stubbed empty table
      },
    );
  });
});
