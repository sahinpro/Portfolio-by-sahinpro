import { ALL_CACHE_TAGS, CACHE_TAGS, PUBLIC_CACHE_TTL_SECONDS, type CacheTag } from "@/lib/revalidate";
import { env } from "@/lib/env";

/**
 * In-memory cache + single-flight deduplication for public API reads.
 * Reduces duplicate network requests when multiple components mount (e.g. hero + footer socials).
 */
const DEFAULT_TTL_MS = PUBLIC_CACHE_TTL_SECONDS * 1000;

export const PUBLIC_CACHE_VERSION_KEY = "portfolio:publicCacheVersion";
export const PUBLIC_CACHE_FLUSH_EVENT = "portfolio:cache-flushed";

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

async function flushServerCache(
  tags: CacheTag[] = [...ALL_CACHE_TAGS],
): Promise<{ ok: boolean; publishedProjectCount?: number }> {
  if (typeof window === "undefined") return { ok: false };

  const body = JSON.stringify({ tags });

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
        cache: "no-store",
      });
      if (adminRes.ok) {
        const data = (await adminRes.json()) as {
          publishedProjectCount?: number;
        };
        return { ok: true, publishedProjectCount: data.publishedProjectCount };
      }
    }

    const token = env.revalidateSecret;
    if (!token) return { ok: false };

    const res = await fetch("/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-token": token,
      },
      body,
      cache: "no-store",
    });
    if (!res.ok) return { ok: false };
    const data = (await res.json()) as { publishedProjectCount?: number };
    return { ok: true, publishedProjectCount: data.publishedProjectCount };
  } catch {
    return { ok: false };
  }
}

/** Clear client cache and purge Redis for public data. */
export async function invalidatePublicDataCache(
  tags: CacheTag[] = [...ALL_CACHE_TAGS],
): Promise<{ ok: boolean; publishedProjectCount?: number }> {
  cache.clear();
  inflight.clear();
  bumpPublicCacheVersion();
  return flushServerCache(tags);
}

/** After project create/update/delete — refresh project lists only. */
export async function invalidateProjectsPublicCache(): Promise<{
  ok: boolean;
  publishedProjectCount?: number;
}> {
  return invalidatePublicDataCache([CACHE_TAGS.projects]);
}

/** Manual admin action — flush every public cache layer. */
export async function flushAllPublicDataCache(): Promise<{
  ok: boolean;
  publishedProjectCount?: number;
}> {
  return invalidatePublicDataCache([...ALL_CACHE_TAGS]);
}
