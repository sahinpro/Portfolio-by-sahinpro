import type { ProjectRow, ResumeRow } from "@/admin/types/database";
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

export async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value ?? ""]));
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
