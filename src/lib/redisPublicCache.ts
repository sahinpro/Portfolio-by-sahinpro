import type { CacheTag } from "@/lib/revalidate";
import { PUBLIC_CACHE_TTL_SECONDS } from "@/lib/revalidate";
import { Redis } from "@upstash/redis";

export const REDIS_PUBLIC_KEYS: Record<CacheTag, string> = {
  projects: "portfolio:public:projects",
  settings: "portfolio:public:settings",
  resume: "portfolio:public:resume",
};

let redisClient: Redis | null | undefined;

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient;

  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) {
    redisClient = null;
    return null;
  }

  redisClient = new Redis({ url, token });
  return redisClient;
}

/** True when Upstash Redis env vars are configured. */
export function isRedisPublicCacheEnabled(): boolean {
  return getRedis() !== null;
}

/**
 * Optional Redis layer in front of Next/Supabase fetches.
 * When Redis is not configured, calls `fetcher` directly.
 */
export async function getRedisCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = PUBLIC_CACHE_TTL_SECONDS,
): Promise<T> {
  const redis = getRedis();
  if (!redis) return fetcher();

  try {
    const hit = await redis.get<T>(key);
    if (hit !== null && hit !== undefined) return hit;
  } catch {
    /* fall through to origin */
  }

  const data = await fetcher();

  try {
    await redis.set(key, data, { ex: ttlSeconds });
  } catch {
    /* best-effort */
  }

  return data;
}

export async function invalidateRedisPublicCache(
  tags: CacheTag[] = Object.keys(REDIS_PUBLIC_KEYS) as CacheTag[],
): Promise<void> {
  const redis = getRedis();
  if (!redis || tags.length === 0) return;

  const keys = tags.map((tag) => REDIS_PUBLIC_KEYS[tag]);
  try {
    await redis.del(...keys);
  } catch {
    /* best-effort */
  }
}
