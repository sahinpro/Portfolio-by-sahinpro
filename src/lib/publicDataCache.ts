import { ALL_CACHE_TAGS, REVALIDATE_SECONDS } from "@/lib/revalidate";
import { env } from "@/lib/env";

/**
 * In-memory cache + single-flight deduplication for public API reads.
 * Reduces duplicate network requests when multiple components mount (e.g. hero + footer socials).
 */
const DEFAULT_TTL_MS = REVALIDATE_SECONDS * 1000;

type CacheEntry<T> = { data: T; storedAt: number };

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

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

function revalidateServerCache(): void {
  if (typeof window === "undefined") return;
  const token = env.analyticsIngestSecret;
  if (!token) return;

  void fetch("/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-token": token,
    },
    body: JSON.stringify({ tags: ALL_CACHE_TAGS }),
  }).catch(() => {
    /* best-effort — ISR still refreshes on schedule */
  });
}

/** Clear client cache and trigger on-demand ISR revalidation for public pages. */
export function invalidatePublicDataCache(): void {
  cache.clear();
  inflight.clear();
  revalidateServerCache();
}
