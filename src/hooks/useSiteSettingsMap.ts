import { fetchSiteSettingsMap } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

export function useSiteSettingsMap(): {
  settings: Record<string, string>;
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("site_settings_map", fetchSiteSettingsMap);
  return { settings: data ?? {}, loading, error };
}
