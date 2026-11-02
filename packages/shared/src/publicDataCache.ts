import {
  ALL_CACHE_TAGS,
  CACHE_TAGS,
  PUBLIC_CACHE_TTL_SECONDS,
  type CacheTag,
} from "./revalidate";

/**
 * In-memory cache + single-flight deduplication for public API reads.
 * Reduces duplicate network requests when multiple components mount (e.g. hero + footer socials).
 *
 * The read side is app-neutral and shared. Server-side flushing is NOT: the
 * cache belongs to the Website deployment, so each application supplies its own
 * `PublicCacheFlush` transport (see each app's `src/lib/publicCache.ts`).
 */
const DEFAULT_TTL_MS = PUBLIC_CACHE_TTL_SECONDS * 1000;

export const PUBLIC_CACHE_VERSION_KEY = "portfolio:publicCacheVersion";
export const PUBLIC_CACHE_FLUSH_EVENT = "portfolio:cache-flushed";

export type PublicCacheFlushResult = {
  ok: boolean;
  publishedProjectCount?: number;
};

export type PublicCacheFlush = (
  tags: CacheTag[],
) => Promise<PublicCacheFlushResult>;

type CacheEntry<T> = { data: T; storedAt: number };

const cache = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

/** Bumped on admin invalidation so this browser skips stale API URLs. */
let publicApiEpoch = 0;

function readStoredEpoch(): number {
  if (typeof window === "undefined") return 0;
  const stored = Number(localStorage.getItem(PUBLIC_CACHE_VERSION_KEY) || 0);
  return Number.isFinite(stored) ? stored : 0;
}

function bumpPublicCacheVersion(): void {
  publicApiEpoch = Date.now();
  if (typeof window === "undefined") return;
  localStorage.setItem(PUBLIC_CACHE_VERSION_KEY, String(publicApiEpoch));
  window.dispatchEvent(new Event(PUBLIC_CACHE_FLUSH_EVENT));
}

export function getPublicApiEpoch(): number {
  return Math.max(publicApiEpoch, readStoredEpoch());
}

export function getCachedPublic<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const versionedKey = `${key}@${getPublicApiEpoch()}`;
  const hit = cache.get(versionedKey) as CacheEntry<T> | undefined;
  if (hit && Date.now() - hit.storedAt < ttlMs) {
    return Promise.resolve(hit.data);
  }

  const pending = inflight.get(versionedKey);
  if (pending) {
    return pending as Promise<T>;
  }

  const p = fetcher()
    .then((data) => {
      cache.set(versionedKey, { data, storedAt: Date.now() });
      inflight.delete(versionedKey);
      return data;
    })
    .catch((err) => {
      inflight.delete(versionedKey);
      throw err;
    });

  inflight.set(versionedKey, p);
  return p as Promise<T>;
}

/** Clear this browser's cache, bump the shared version, then flush the server cache. */
export async function invalidatePublicDataCache(
  flush: PublicCacheFlush,
  tags: CacheTag[] = [...ALL_CACHE_TAGS],
): Promise<PublicCacheFlushResult> {
  cache.clear();
  inflight.clear();
  bumpPublicCacheVersion();
  if (typeof window === "undefined") return { ok: false };
  return flush(tags);
}

/** After project create/update/delete — refresh project lists only. */
export function projectCacheTags(): CacheTag[] {
  return [CACHE_TAGS.projects];
}

/** After testimonial create/update/delete — refresh homepage slider and project pages. */
export function testimonialCacheTags(): CacheTag[] {
  return [CACHE_TAGS.testimonials, CACHE_TAGS.projects];
}

export { ALL_CACHE_TAGS, CACHE_TAGS, type CacheTag };
