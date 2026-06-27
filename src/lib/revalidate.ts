/** ISR interval for public pages and Supabase data cache (seconds). */
export const REVALIDATE_SECONDS = 3600;

export const CACHE_TAGS = {
  projects: "projects",
  settings: "settings",
  resume: "resume",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS);
