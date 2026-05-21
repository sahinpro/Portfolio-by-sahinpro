import { fetchPublishedProjectBySlug } from "@/data/publicSupabase";
import { mapProjectRowToPublicDetail, type PublicProjectDetail } from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublishedProject(slug: string | undefined): {
  project: PublicProjectDetail | null;
  loading: boolean;
  error: Error | null;
} {
  const key = slug ? `published_project:${slug}` : "published_project:__empty__";
  const { data, loading, error } = usePublicData(key, () => {
    if (!slug) return Promise.resolve(null);
    return fetchPublishedProjectBySlug(slug);
  });
  const project = useMemo(() => (data ? mapProjectRowToPublicDetail(data) : null), [data]);
  return { project, loading, error };
}
