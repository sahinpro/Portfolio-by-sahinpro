import { parseCacheFlushBody } from "@sahinpro/shared/cacheFlushSchema";
import { ALL_CACHE_TAGS, type CacheTag } from "@sahinpro/shared/revalidate";
import { Hono } from "hono";

import { readJsonBody } from "../lib/jsonBody";
import { logServerEvent } from "../lib/logger";
import { revalidateWebsiteCache } from "../lib/websiteRevalidation";
import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `POST /api/_revalidate` — own-app revalidation action (audit §11 design).
 *
 * The Website deployment owns the public cache, so a relative `/api/...` flush
 * from this origin would flush nothing. This endpoint verifies the caller and
 * then relays server-to-server to `{WEBSITE_URL}/api/revalidate`.
 *
 * Authorization is *added to*, never replaced by, the pre-split check: the
 * bearer token still has to belong to an allowlisted admin
 * (`isAllowedAdminEmail`) and the server-only `REVALIDATE_SECRET` never leaves
 * the server. Nothing here can be reached without both.
 *
 * Response shape is what `src/lib/publicCache.ts` consumes:
 *   2xx `{ ok: true, publishedProjectCount? }`
 *   503 `{ ok: false, revalidationFailed: true, reason }` for config/upstream
 *       failures — the mutation already succeeded, so the CMS shows
 *       "saved, cache refresh pending" and can retry.
 *   400 for a malformed `tags` value (same as the website's flush endpoints).
 */
export const websiteRevalidateRoutes = new Hono<ApiEnv>();

type FlushBody = { tags: CacheTag[] } | { error: string };

type RelayResult =
  | { publishedProjectCount?: number }
  | { failed: { reason: string; status?: number } };

/** Read a flush body into the tag list to send upstream. */
async function parseFlushBody(c: {
  req: { json: () => Promise<unknown> };
}): Promise<FlushBody> {
  const parsed = parseCacheFlushBody(await readJsonBody(c));
  if (!parsed.ok) return { error: parsed.error };
  return { tags: parsed.tags?.length ? parsed.tags : [...ALL_CACHE_TAGS] };
}

/** Shared relay + logging, so both endpoint spellings behave identically. */
async function relayFlush(tags: CacheTag[]): Promise<RelayResult> {
  const outcome = await revalidateWebsiteCache(tags);

  if (!outcome.ok) {
    // Structured, secret-free diagnostic: `reason` is a fixed code, never the
    // target URL or the token (audit §11 failure handling).
    logServerEvent("warn", "website_revalidate_failed", {
      reason: outcome.reason,
      status: outcome.status,
      tagCount: tags.length,
    });
    return { failed: { reason: outcome.reason, status: outcome.status } };
  }

  logServerEvent("info", "website_revalidate_ok", { tagCount: tags.length });
  return { publishedProjectCount: outcome.publishedProjectCount };
}

websiteRevalidateRoutes.post("/_revalidate", requireAdminBearer, async (c) => {
  const body = await parseFlushBody(c);
  if ("error" in body) {
    return c.json({ error: body.error }, 400);
  }

  const result = await relayFlush(body.tags);
  if ("failed" in result) {
    return c.json(
      { ok: false, revalidationFailed: true, reason: result.failed.reason },
      503,
    );
  }
  return c.json({
    ok: true,
    publishedProjectCount: result.publishedProjectCount,
  });
});

/**
 * `POST /admin/flush-cache` — the pre-split URL, now served on this origin.
 *
 * Kept as a thin alias of `/_revalidate` so any CMS build (or bookmarklet)
 * still calling the legacy path flushes the website cache instead of silently
 * hitting its own origin and doing nothing. The response keeps the original
 * `{ flushed: true, ... }` shape; `/_revalidate` uses `{ ok: true }`.
 */
websiteRevalidateRoutes.post(
  "/admin/flush-cache",
  requireAdminBearer,
  async (c) => {
    const body = await parseFlushBody(c);
    if ("error" in body) {
      return c.json({ error: body.error }, 400);
    }

    const result = await relayFlush(body.tags);
    if ("failed" in result) {
      return c.json(
        {
          flushed: false,
          revalidationFailed: true,
          reason: result.failed.reason,
        },
        503,
      );
    }
    return c.json({
      flushed: true,
      publishedProjectCount: result.publishedProjectCount,
    });
  },
);
