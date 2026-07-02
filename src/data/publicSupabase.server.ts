import "server-only";

import type { ProjectRow, ResumeRow } from "@/admin/types/database";
import { CACHE_TAGS, REVALIDATE_SECONDS } from "@/lib/revalidate";
import {
  getRedisCached,
  REDIS_PUBLIC_KEYS,
} from "@/lib/redisPublicCache";
import { unstable_cache } from "next/cache";
import * as publicSupabase from "@/data/publicSupabase";

const fetchPublishedProjectsFromDb = unstable_cache(
  publicSupabase.fetchPublishedProjects,
  ["published-projects"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.projects] },
);

const fetchSiteSettingsMapFromDb = unstable_cache(
  publicSupabase.fetchSiteSettingsMap,
  ["site-settings-map"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.settings] },
);

const fetchActiveResumeFromDb = unstable_cache(
  publicSupabase.fetchActiveResume,
  ["active-resume"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.resume] },
);

export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.projects,
    fetchPublishedProjectsFromDb,
    REVALIDATE_SECONDS,
  );
}

export async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.settings,
    fetchSiteSettingsMapFromDb,
    REVALIDATE_SECONDS,
  );
}

export async function fetchActiveResume(): Promise<
  publicSupabase.PublicActiveResume | null
> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.resume,
    fetchActiveResumeFromDb,
    REVALIDATE_SECONDS,
  );
}

export type { PublicActiveResume } from "@/data/publicSupabase";
export type { ProjectRow, ResumeRow };
