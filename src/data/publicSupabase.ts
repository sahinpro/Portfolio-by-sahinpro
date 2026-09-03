import type { ProjectRow, ResumeRow } from "@/admin/types/database";
import { isPublicFileReachable } from "@/lib/publicFileReachable";
import { latestStoredResume } from "@/lib/resumeStorage";
import { supabase } from "@/utils/supabase";

export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("updated_at", { ascending: false });
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

  const file_name = (data?.file_name as string | null) ?? null;
  const file_url = typeof data?.file_url === "string" ? data.file_url : "";

  if (file_url && (await isPublicFileReachable(file_url))) {
    return { file_url, file_name };
  }

  const stored = await latestStoredResume();
  if (!stored) return null;

  return {
    file_url: stored.file_url,
    file_name: file_name || stored.file_name,
  };
}
