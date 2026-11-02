/**
 * 405 vs 404 semantics — the pre-split Next.js route-handler contract:
 * a KNOWN endpoint hit with an unregistered verb answers 405, an UNKNOWN
 * endpoint answers 404. Under the old per-route handlers the framework gave
 * both for free; inside the single Hono catch-all the distinction is rebuilt
 * by the `api.all("*")` fallback in `../app.ts`.
 *
 * Status codes only (bodies are JSON, the framework's were not — that
 * difference is documented in app.ts and intentionally not asserted here).
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { api } from "../app";
import { withEnv } from "./harness";

describe("website api: 405/404 fallback", () => {
  it("answers 404 for an unknown endpoint", async () => {
    const res = await api.request("/api/does-not-exist", { method: "GET" });
    assert.equal(res.status, 404);
    assert.deepEqual(await res.json(), { error: "Not Found" });
  });

  it("answers 404 for an unknown endpoint under a known prefix", async () => {
    const res = await api.request("/api/public/unknown-collection", {
      method: "GET",
    });
    assert.equal(res.status, 404);
  });

  it("answers 405 + Allow for a known endpoint with an unregistered verb", async () => {
    const res = await api.request("/api/pageview", { method: "GET" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "POST");
    assert.deepEqual(await res.json(), { error: "Method Not Allowed" });
  });

  it("keeps GET-only endpoints 405 for writes", async () => {
    const res = await api.request("/api/public/projects", { method: "DELETE" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "GET");
  });

  it("lists every registered verb in Allow (contact: POST + OPTIONS)", async () => {
    const res = await api.request("/api/contact", { method: "PUT" });
    assert.equal(res.status, 405);
    assert.equal(res.headers.get("allow"), "OPTIONS, POST");
  });

  it("does not mask registered verbs — OPTIONS /api/contact still answers 200", async () => {
    const res = await api.request("/api/contact", { method: "OPTIONS" });
    assert.equal(res.status, 200);
    assert.equal(
      res.headers.get("access-control-allow-methods"),
      "POST, OPTIONS",
    );
  });

  it("does not mask registered verbs — POST /api/pageview still answers 204", async () => {
    // Analytics env forced absent: the route short-circuits before any fetch,
    // keeping this stub-free test deterministic regardless of the local .env.
    await withEnv(
      {
        NEXT_PUBLIC_SUPABASE_URL: undefined,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: undefined,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: undefined,
        ANALYTICS_INGEST_SECRET: undefined,
        NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: undefined,
      },
      async () => {
        const res = await api.request("/api/pageview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        assert.equal(res.status, 204);
      },
    );
  });
});
