import { fetchPublishedProjects } from "@/data/publicSupabase";
import { mapProjectRowToPublic, type PublicProject } from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublishedProjects(): {
  projects: PublicProject[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("published_projects", fetchPublishedProjects);
  const projects = useMemo(() => (data ?? []).map(mapProjectRowToPublic), [data]);
  return { projects, loading, error };
}
