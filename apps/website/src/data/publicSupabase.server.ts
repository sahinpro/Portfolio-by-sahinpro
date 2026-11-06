import "server-only";

import type { ProjectRow, ResumeRow, TestimonialRow } from "@sahinpro/shared/types/database";
import * as publicSupabase from "@/data/publicSupabase";
import { isPublicFileReachable } from "@sahinpro/shared/publicFileReachable";
import {
  getRedisCached,
  invalidateRedisPublicCache,
  REDIS_PUBLIC_KEYS,
} from "@/lib/redisPublicCache";
import { PUBLIC_CACHE_TTL_SECONDS } from "@sahinpro/shared/revalidate";

/**
 * Server reads: Redis → Supabase (no Next.js Data Cache).
 *
 * Process-local in-flight promise deduplication. When multiple concurrent
 * callers within the same Node process (e.g. `generateMetadata` and the page
 * component of a single render, or two overlapping requests) call
 * `fetchPublishedProjects` / `fetchTestimonials` while the underlying Redis /
 * Supabase fetch is still pending, they share one promise and therefore one
 * round-trip. The slot is cleared on settle (`.finally`), so nothing is
 * retained across requests.
 *
 * This is NOT React's request-scoped `cache()` — it is a lightweight
 * equivalent that works on React 18. Safety requirement: both fetchers
 * return fully public, non-user-specific data (published projects, all
 * testimonials), with no dependency on cookies, headers, session, or any
 * per-request argument. Redis keys are static. Sharing the in-flight
 * promise across concurrent callers therefore cannot leak user-specific
 * data.
 */
let projectsPromise: Promise<ProjectRow[]> | null = null;
let testimonialsPromise: Promise<TestimonialRow[]> | null = null;

export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  if (projectsPromise) return projectsPromise;
  projectsPromise = getRedisCached(
    REDIS_PUBLIC_KEYS.projects,
    publicSupabase.fetchPublishedProjects,
    PUBLIC_CACHE_TTL_SECONDS,
  ).finally(() => {
    projectsPromise = null;
  });
  return projectsPromise;
}

export async function fetchTestimonials(): Promise<TestimonialRow[]> {
  if (testimonialsPromise) return testimonialsPromise;
  testimonialsPromise = getRedisCached(
    REDIS_PUBLIC_KEYS.testimonials,
    publicSupabase.fetchTestimonials,
    PUBLIC_CACHE_TTL_SECONDS,
  ).finally(() => {
    testimonialsPromise = null;
  });
  return testimonialsPromise;
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
  const cached = await getRedisCached(
    REDIS_PUBLIC_KEYS.resume,
    publicSupabase.fetchActiveResume,
    PUBLIC_CACHE_TTL_SECONDS,
  );
  if (cached?.file_url && (await isPublicFileReachable(cached.file_url))) {
    return cached;
  }

  if (!cached?.file_url) return cached;

  // Stale Redis can keep a deleted storage URL for up to the TTL — resolve from origin.
  await invalidateRedisPublicCache(["resume"]);
  return getRedisCached(
    REDIS_PUBLIC_KEYS.resume,
    publicSupabase.fetchActiveResume,
    PUBLIC_CACHE_TTL_SECONDS,
  );
}

export type { PublicActiveResume } from "@/data/publicSupabase";
export type { ProjectRow, ResumeRow, TestimonialRow };
