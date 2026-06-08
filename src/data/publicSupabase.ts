import type {
  ProjectRow,
  ResumeRow,
  SeoSettingsRow,
  SocialLinkRow,
  TestimonialRow,
} from "@/admin/types/database";
import {
  isLegacyProjectIdParam,
  projectSlugFromTitle,
} from "@/lib/projectPaths";
import { supabase } from "@/utils/supabase";

export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}

export async function fetchPublishedProjectById(id: string): Promise<ProjectRow | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw error;
  return (data as ProjectRow | null) ?? null;
}

export async function fetchPublishedProjectBySlug(
  slug: string,
): Promise<ProjectRow | null> {
  if (isLegacyProjectIdParam(slug)) {
    return fetchPublishedProjectById(slug);
  }
  const projects = await fetchPublishedProjects();
  return projects.find((row) => projectSlugFromTitle(row.title) === slug) ?? null;
}

export async function fetchPublishedProjectSlugs(): Promise<string[]> {
  const projects = await fetchPublishedProjects();
  return projects.map((row) => projectSlugFromTitle(row.title));
}

export async function fetchPublishedTestimonials(): Promise<TestimonialRow[]> {
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("status", "published")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as TestimonialRow[];
}

export async function fetchVisibleSocialLinks(): Promise<SocialLinkRow[]> {
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .eq("visible", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  const rows = (data ?? []) as SocialLinkRow[];
  const seenUrl = new Set<string>();
  return rows.filter((r) => {
    const key = r.url.trim().toLowerCase();
    if (seenUrl.has(key)) return false;
    seenUrl.add(key);
    return true;
  });
}

export async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
}

export async function fetchSeoForPage(page: string): Promise<SeoSettingsRow | null> {
  const { data, error } = await supabase
    .from("seo_settings")
    .select("*")
    .eq("page", page)
    .maybeSingle();
  if (error) throw error;
  return (data as SeoSettingsRow | null) ?? null;
}

export type PublicActiveResume = Pick<ResumeRow, "file_url" | "file_name">;

export async function fetchActiveResume(): Promise<PublicActiveResume | null> {
  const { data, error } = await supabase
    .from("resume")
    .select("file_url, file_name")
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  if (!data?.file_url) return null;
  return {
    file_url: data.file_url as string,
    file_name: (data.file_name as string | null) ?? null,
  };
}
