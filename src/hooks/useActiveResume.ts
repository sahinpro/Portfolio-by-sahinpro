import type { PublicActiveResume } from "@/data/publicSupabase";
import { fetchActiveResume } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

/**
 * Active resume row from Supabase (admin → Resume / CV). Cached with other public reads.
 */
export function useActiveResume() {
  return usePublicData<PublicActiveResume | null>("public:active-resume", fetchActiveResume);
}
