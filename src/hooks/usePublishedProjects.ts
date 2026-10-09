import type { ProjectRow } from "@/admin/types/database";
import { fetchPublishedProjects } from "@/data/publicSupabase.client";
import {
  mapProjectRowToPublicDetail,
  type PublicProjectDetail,
} from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublishedProjects(initialRows?: ProjectRow[] | null): {
  projects: PublicProjectDetail[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData(
    "published_projects",
    fetchPublishedProjects,
    { initialData: initialRows ?? null },
  );
  const projects = useMemo(
    () => (data ?? []).map(mapProjectRowToPublicDetail),
    [data],
  );
  return { projects, loading, error };
}
