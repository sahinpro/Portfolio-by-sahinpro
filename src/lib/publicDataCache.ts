import {
  ALL_CACHE_TAGS,
  CACHE_TAGS,
  PUBLIC_REVALIDATE_PATHS,
  REVALIDATE_PATHS_BY_TAG,
  REVALIDATE_SECONDS,
  type CacheTag,
} from "@/lib/revalidate";
import { env } from "@/lib/env";

/**
 * In-memory cache + single-flight deduplication for public API reads.
 * Reduces duplicate network requests when multiple components mount (e.g. hero + footer socials).
 */
const DEFAULT_TTL_MS = REVALIDATE_SECONDS * 1000;

type CacheEntry<T> = { data: T; storedAt: number };

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Bumped on admin invalidation so this browser skips stale API URLs. */
let publicApiEpoch = 0;

export function getPublicApiEpoch(): number {
  return publicApiEpoch;
}

export function getCachedPublic<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const hit = cache.get(key) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.storedAt < ttlMs) {
    return Promise.resolve(hit.data);
  }

  const pending = inflight.get(key);
  if (pending) {
    return pending as Promise<T>;
  }

  const p = fetcher()
    .then((data) => {
      cache.set(key, { data, storedAt: Date.now() });
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, p);
  return p as Promise<T>;
}

function pathsForTags(tags: CacheTag[]): string[] {
  const paths = new Set<string>();
  if (tags.length === ALL_CACHE_TAGS.length) {
    for (const path of PUBLIC_REVALIDATE_PATHS) paths.add(path);
    return [...paths];
  }
  for (const tag of tags) {
    for (const path of REVALIDATE_PATHS_BY_TAG[tag]) paths.add(path);
  }
  return [...paths];
}

async function revalidateServerCache(
  tags: CacheTag[] = [...ALL_CACHE_TAGS],
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const body = JSON.stringify({
    tags,
    paths: pathsForTags(tags),
  });

  try {
    const { supabase } = await import("@/utils/supabase");
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const adminRes = await fetch("/api/admin/flush-cache", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body,
      });
      if (adminRes.ok) return true;
    }

    const token = env.revalidateSecret;
    if (!token) return false;

    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": token,
      },
      body,
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Clear client cache and purge Redis + ISR for public data. */
export async function invalidatePublicDataCache(
  tags: CacheTag[] = [...ALL_CACHE_TAGS],
): Promise<boolean> {
  cache.clear();
  inflight.clear();
  publicApiEpoch += 1;
  return revalidateServerCache(tags);
}

/** After project create/update/delete — refresh project lists only. */
export async function invalidateProjectsPublicCache(): Promise<boolean> {
  return invalidatePublicDataCache([CACHE_TAGS.projects]);
}

/** Manual admin action — flush every public cache layer. */
export async function flushAllPublicDataCache(): Promise<boolean> {
  return invalidatePublicDataCache([...ALL_CACHE_TAGS]);
}
