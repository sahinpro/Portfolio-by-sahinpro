import type { ProjectRow } from "@/admin/types/database";
import type { PublicActiveResume } from "@/data/publicSupabase";
import { getPublicApiEpoch } from "@/lib/publicDataCache";

async function fetchPublicJson<T>(path: string): Promise<T> {
  const epoch = getPublicApiEpoch();
  const url = epoch > 0 ? `${path}?v=${epoch}` : path;
  const res = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Public API ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Browser-safe reads via cached `/api/public/*` routes (not direct Supabase). */
export async function fetchPublishedProjects(): Promise<ProjectRow[]> {
  return fetchPublicJson<ProjectRow[]>("/api/public/projects");
}

export async function fetchSiteSettingsMap(): Promise<Record<string, string>> {
  return fetchPublicJson<Record<string, string>>("/api/public/settings");
}

export async function fetchActiveResume(): Promise<PublicActiveResume | null> {
  return fetchPublicJson<PublicActiveResume | null>("/api/public/resume");
}

export type { PublicActiveResume };
