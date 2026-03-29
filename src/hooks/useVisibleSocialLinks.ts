import type { SocialLinkRow } from "@/admin/types/database";
import { fetchVisibleSocialLinks } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

export function useVisibleSocialLinks(): {
  links: SocialLinkRow[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("visible_social_links", fetchVisibleSocialLinks);
  return { links: data ?? [], loading, error };
}
