/** ISR interval for public pages and Supabase data cache (seconds). */
export const REVALIDATE_SECONDS = 3600;

export const CACHE_TAGS = {
  projects: "projects",
  settings: "settings",
  resume: "resume",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

export const ALL_CACHE_TAGS = Object.values(CACHE_TAGS);

/** Paths purged when public content changes (API + pages). */
export const PUBLIC_REVALIDATE_PATHS = [
  "/api/public/projects",
  "/api/public/settings",
  "/api/public/resume",
  "/",
  "/projects",
  "/about",
] as const;

export const REVALIDATE_PATHS_BY_TAG: Record<CacheTag, readonly string[]> = {
  projects: ["/api/public/projects", "/", "/projects"],
  settings: ["/api/public/settings", "/"],
  resume: ["/api/public/resume", "/about"],
};
