import type { PublicActiveResume } from "@/data/publicSupabase.client";
import { fetchActiveResume } from "@/data/publicSupabase.client";
import { usePublicData } from "@/hooks/usePublicData";

type UseActiveResumeOptions = {
  deferMs?: number;
};

/**
 * Active resume via cached public API (admin → Resume / CV).
 */
export function useActiveResume(options?: UseActiveResumeOptions) {
  return usePublicData<PublicActiveResume | null>(
    "public:active-resume",
    fetchActiveResume,
    options,
  );
}
