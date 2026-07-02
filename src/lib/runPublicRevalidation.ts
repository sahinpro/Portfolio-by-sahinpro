import "server-only";

import { invalidateRedisPublicCache } from "@/lib/redisPublicCache";
import {
  ALL_CACHE_TAGS,
  PUBLIC_REVALIDATE_PATHS,
  type CacheTag,
} from "@/lib/revalidate";
import { revalidatePath, revalidateTag } from "next/cache";

export async function runPublicRevalidation(options?: {
  tags?: CacheTag[];
  paths?: string[];
}): Promise<{ tags: CacheTag[]; paths: string[] }> {
  const tags = options?.tags?.length ? options.tags : [...ALL_CACHE_TAGS];
  for (const tag of tags) {
    revalidateTag(tag);
  }
  await invalidateRedisPublicCache(tags);

  const paths = options?.paths?.length
    ? options.paths
    : [...PUBLIC_REVALIDATE_PATHS];
  for (const path of paths) {
    revalidatePath(path);
  }

  return { tags, paths };
}
