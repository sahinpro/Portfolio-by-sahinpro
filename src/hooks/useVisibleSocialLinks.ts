import type { SocialLinkRow } from "@/admin/types/database";
import { fetchVisibleSocialLinks } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

type UseVisibleSocialLinksOptions = {
  deferMs?: number;
};

export function useVisibleSocialLinks(options?: UseVisibleSocialLinksOptions): {
  links: SocialLinkRow[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData(
    "visible_social_links",
    fetchVisibleSocialLinks,
    options,
  );
  return { links: data ?? [], loading, error };
}
