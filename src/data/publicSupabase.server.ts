import "server-only";

import type { ProjectRow, ResumeRow } from "@/admin/types/database";
import * as publicSupabase from "@/data/publicSupabase";
import { getRedisCached, REDIS_PUBLIC_KEYS } from "@/lib/redisPublicCache";
import { PUBLIC_CACHE_TTL_SECONDS } from "@/lib/revalidate";

/** Server reads: Redis → Supabase (no Next.js Data Cache). */
export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.projects,
    publicSupabase.fetchPublishedProjects,
    PUBLIC_CACHE_TTL_SECONDS,
  );
}

export async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.settings,
    publicSupabase.fetchSiteSettingsMap,
    PUBLIC_CACHE_TTL_SECONDS,
  );
}

export async function fetchActiveResume(): Promise<
  publicSupabase.PublicActiveResume | null
> {
  return getRedisCached(
    REDIS_PUBLIC_KEYS.resume,
    publicSupabase.fetchActiveResume,
    PUBLIC_CACHE_TTL_SECONDS,
  );
}

export type { PublicActiveResume } from "@/data/publicSupabase";
export type { ProjectRow, ResumeRow };
