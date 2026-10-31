/**
 * GET /api/public/* — the public read contract: same payloads and, crucially,
 * the same `Cache-Control` as before the migration. These responses are
 * Redis-cached server-side, so they must NEVER be CDN-cached (a flush has to
 * take effect instantly). Supabase reads resolve against the fetch stub, so
 * no real table is queried.
 */
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/publicApiCacheHeaders";
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import { defaultStubRoutes, installFetchStub, withEnv } from "./harness";

const PUBLIC_ENV = {
  NEXT_PUBLIC_SUPABASE_URL: undefined, // shared client falls back to invalid.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined,
  UPSTASH_REDIS_REST_URL: undefined, // redis passthrough → straight to Supabase
  UPSTASH_REDIS_REST_TOKEN: undefined,
};

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

async function getPublic(path: string) {
  stub = installFetchStub(defaultStubRoutes());
  return withEnv(PUBLIC_ENV, async () => api.request(path, { method: "GET" }));
}

describe("website api: public reads keep no-CDN cache headers", () => {
  const paths = [
    "/api/public/projects",
    "/api/public/testimonials",
    "/api/public/settings",
    "/api/public/resume",
  ] as const;

  for (const path of paths) {
    it(`${path} → 200 with "${PUBLIC_API_CACHE_CONTROL}"`, async () => {
      const res = await getPublic(path);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("cache-control"), PUBLIC_API_CACHE_CONTROL);
    });
  }

  it("/api/public/resume/file answers 404 (never CDN-cached) when no resume exists", async () => {
    const res = await getPublic("/api/public/resume/file");
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "Resume is not available" });
  });
});
