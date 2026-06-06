import type { PublicActiveResume } from "@/data/publicSupabase";
import { fetchActiveResume } from "@/data/publicSupabase";
import { usePublicData } from "@/hooks/usePublicData";

type UseActiveResumeOptions = {
  deferMs?: number;
};

/**
 * Active resume row from Supabase (admin → Resume / CV). Cached with other public reads.
 */
export function useActiveResume(options?: UseActiveResumeOptions) {
  return usePublicData<PublicActiveResume | null>(
    "public:active-resume",
    fetchActiveResume,
    options,
  );
}
