import { flushPublicCache } from "@/lib/runPublicRevalidation";
import { parseCacheFlushBody } from "@sahinpro/shared/cacheFlushSchema";
import { ALL_CACHE_TAGS } from "@sahinpro/shared/revalidate";
import { Hono } from "hono";
import { readJsonBody } from "../lib/jsonBody";
import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `POST /api/admin/flush-cache` — admin-initiated public cache flush.
 *
 * Same path, same bearer-token admin check and same `{ flushed: true, tags,
 * publishedProjectCount }` response as before the Hono migration. Kept on the
 * website because the website deployment owns the Redis/Next public cache.
 *
 * Stage C transition note: the CMS browser client used to call this same-origin
 * endpoint directly. Now that the CMS is its own deployment, `apps/admin` serves
 * the identical path itself and relays here through `POST /api/revalidate` with
 * the server-only `REVALIDATE_SECRET`. This handler stays exactly as it was for
 * any pre-split caller still pointing at the website origin (audit §11), has no
 * remaining website-side consumer, and is deleted in Stage E rather than kept as
 * a second live write path.
 */
export const adminCacheRoutes = new Hono<ApiEnv>().post(
  "/admin/flush-cache",
  requireAdminBearer,
  async (c) => {
    const parsed = parseCacheFlushBody(await readJsonBody(c));
    if (!parsed.ok) {
      return c.json({ error: parsed.error }, 400);
    }

    const tags = parsed.tags?.length ? parsed.tags : [...ALL_CACHE_TAGS];
    const result = await flushPublicCache({ tags });

    return c.json({ flushed: true, ...result });
  },
);
