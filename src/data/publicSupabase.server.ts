import "server-only";

import type {
  ProjectRow,
  ResumeRow,
  SeoSettingsRow,
  SocialLinkRow,
  TestimonialRow,
} from "@/admin/types/database";
import { CACHE_TAGS, REVALIDATE_SECONDS } from "@/lib/revalidate";
import { unstable_cache } from "next/cache";
import * as publicSupabase from "@/data/publicSupabase";

export const fetchPublishedProjects = unstable_cache(
  publicSupabase.fetchPublishedProjects,
  ["published-projects"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.projects] },
);

export const fetchPublishedTestimonials = unstable_cache(
  publicSupabase.fetchPublishedTestimonials,
  ["published-testimonials"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.testimonials] },
);

export const fetchVisibleSocialLinks = unstable_cache(
  publicSupabase.fetchVisibleSocialLinks,
  ["visible-social-links"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.social] },
);

export const fetchSiteSettingsMap = unstable_cache(
  publicSupabase.fetchSiteSettingsMap,
  ["site-settings-map"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.settings] },
);

export const fetchSeoForPage = (page: string) =>
  unstable_cache(
    () => publicSupabase.fetchSeoForPage(page),
    ["seo-for-page", page],
    { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.seo] },
  )();

export const fetchActiveResume = unstable_cache(
  publicSupabase.fetchActiveResume,
  ["active-resume"],
  { revalidate: REVALIDATE_SECONDS, tags: [CACHE_TAGS.resume] },
);

export type { PublicActiveResume } from "@/data/publicSupabase";
export type {
  ProjectRow,
  ResumeRow,
  SeoSettingsRow,
  SocialLinkRow,
  TestimonialRow,
};
