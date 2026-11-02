import {
  invalidatePublicDataCache as invalidateSharedPublicCache,
  projectCacheTags,
  testimonialCacheTags,
  type PublicCacheFlushResult,
} from "@sahinpro/shared/publicDataCache";
import { ALL_CACHE_TAGS, type CacheTag } from "@sahinpro/shared/revalidate";
import { supabase } from "@sahinpro/shared/supabase";

/**
 * Admin-side website cache flush.
 *
 * The public cache belongs to the **Website** deployment, so this app can no
 * longer flush a relative `/api/admin/flush-cache` the way it did while the CMS
 * shipped inside the website bundle — on `admin.sahinpro.me` that URL is this
 * app's own origin, and the pre-split handler is not there. It now calls this
 * app's own `POST /api/_revalidate` (same origin, bearer-authenticated exactly as
 * before), which relays server-to-server to `{WEBSITE_URL}/api/revalidate` with
 * the server-only `REVALIDATE_SECRET`. See `src/server/api/lib/websiteRevalidation.ts`
 * and audit §11 for the topology; nothing about the caller's authorization
 * changed — the browser still sends the signed-in admin's Supabase access token.
 *
 * Best-effort by design: a failed flush never rolls back a saved record — the
 * caller reports "saved, cache refresh pending" (same contract as before the
 * monorepo split). An unconfigured `WEBSITE_URL`/`REVALIDATE_SECRET` shows up as
 * a 503 from our own route and is treated exactly like any other failed flush.
 */
const WEBSITE_CACHE_FLUSH_ENDPOINT = "/api/_revalidate";

async function flushWebsiteCache(
  tags: CacheTag[],
): Promise<PublicCacheFlushResult> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return { ok: false };

    const res = await fetch(WEBSITE_CACHE_FLUSH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ tags }),
      cache: "no-store",
    });
    if (!res.ok) return { ok: false };

    const data = (await res.json()) as { publishedProjectCount?: number };
    return { ok: true, publishedProjectCount: data.publishedProjectCount };
  } catch {
    return { ok: false };
  }
}

export function invalidatePublicDataCache(
  tags?: CacheTag[],
): Promise<PublicCacheFlushResult> {
  return invalidateSharedPublicCache(flushWebsiteCache, tags);
}

/** After project create/update/delete — refresh project lists only. */
export function invalidateProjectsPublicCache(): Promise<PublicCacheFlushResult> {
  return invalidateSharedPublicCache(flushWebsiteCache, projectCacheTags());
}

/** After testimonial create/update/delete — refresh homepage slider and project pages. */
export function invalidateTestimonialsPublicCache(): Promise<PublicCacheFlushResult> {
  return invalidateSharedPublicCache(flushWebsiteCache, testimonialCacheTags());
}

/** Manual admin action — flush every public cache layer. */
export function flushAllPublicDataCache(): Promise<PublicCacheFlushResult> {
  return invalidateSharedPublicCache(flushWebsiteCache, [...ALL_CACHE_TAGS]);
}
