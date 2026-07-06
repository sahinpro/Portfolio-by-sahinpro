/** Redis TTL for public Supabase reads (seconds). */
export const PUBLIC_CACHE_TTL_SECONDS = 3600;

/** @deprecated Use PUBLIC_CACHE_TTL_SECONDS */
export const REVALIDATE_SECONDS = PUBLIC_CACHE_TTL_SECONDS;

/** Logical cache keys flushed via Redis invalidation. */
export const CACHE_TAGS = {
  projects: "projects",
  settings: "settings",
  resume: "resume",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS);
