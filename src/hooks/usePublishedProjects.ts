import { fetchPublishedProjects } from "@/data/publicSupabase.client";
import {
  mapProjectRowToPublicDetail,
  type PublicProjectDetail,
} from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublishedProjects(): {
  projects: PublicProjectDetail[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("published_projects", fetchPublishedProjects);
  const projects = useMemo(
    () => (data ?? []).map(mapProjectRowToPublicDetail),
    [data],
  );
  return { projects, loading, error };
}
