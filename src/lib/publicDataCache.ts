/**
 * In-memory cache + single-flight deduplication for public Supabase reads.
 * Reduces duplicate network requests when multiple components mount (e.g. hero + footer socials).
 */
const DEFAULT_TTL_MS = 120_000;

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

/** Clear all cached public reads (e.g. after admin publish in same tab    optional). */
export function invalidatePublicDataCache(): void {
  cache.clear();
  inflight.clear();
}
