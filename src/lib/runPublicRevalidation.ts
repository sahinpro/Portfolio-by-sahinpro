import "server-only";

import * as publicSupabase from "@/data/publicSupabase";
import { invalidateRedisPublicCache } from "@/lib/redisPublicCache";
import { ALL_CACHE_TAGS, type CacheTag } from "@/lib/revalidate";

export type PublicCacheFlushResult = {
  tags: CacheTag[];
  publishedProjectCount: number;
};

/** Flush Redis public cache keys, then verify with a direct Supabase read. */
export async function flushPublicCache(options?: {
  tags?: CacheTag[];
}): Promise<PublicCacheFlushResult> {
  const tags = options?.tags?.length ? options.tags : [...ALL_CACHE_TAGS];
  await invalidateRedisPublicCache(tags);

  const published = await publicSupabase.fetchPublishedProjects();

  return { tags, publishedProjectCount: published.length };
}

/** @deprecated Use flushPublicCache */
export const runPublicRevalidation = flushPublicCache;
