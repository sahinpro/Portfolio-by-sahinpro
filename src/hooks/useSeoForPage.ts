import type { SeoSettingsRow } from "@/admin/types/database";
import { fetchSeoForPage } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

export function useSeoForPage(page: string): {
  seo: SeoSettingsRow | null;
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData(`seo_page:${page}`, () => fetchSeoForPage(page));
  return { seo: data ?? null, loading, error };
}
