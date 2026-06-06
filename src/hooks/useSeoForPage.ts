import type { SeoSettingsRow } from "@/admin/types/database";
import { fetchSeoForPage } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

type UseSeoForPageOptions = {
  deferMs?: number;
};

export function useSeoForPage(
  page: string,
  options?: UseSeoForPageOptions,
): {
  seo: SeoSettingsRow | null;
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData(
    `seo_page:${page}`,
    () => fetchSeoForPage(page),
    options,
  );
  return { seo: data ?? null, loading, error };
}
