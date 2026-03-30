import { fetchPublishedProjectById } from "@/data/publicSupabase";
import { mapProjectRowToPublicDetail, type PublicProjectDetail } from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublishedProject(id: string | undefined): {
  project: PublicProjectDetail | null;
  loading: boolean;
  error: Error | null;
} {
  const key = id ? `published_project:${id}` : "published_project:__empty__";
  const { data, loading, error } = usePublicData(key, () => {
    if (!id) return Promise.resolve(null);
    return fetchPublishedProjectById(id);
  });
  const project = useMemo(() => (data ? mapProjectRowToPublicDetail(data) : null), [data]);
  return { project, loading, error };
}
