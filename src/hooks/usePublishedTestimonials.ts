import { fetchPublishedTestimonials } from "@/data/publicSupabase";
import type { TestimonialRow } from "@/admin/types/database";
import { usePublicData } from "@/hooks/usePublicData";

export function usePublishedTestimonials(): {
  rows: TestimonialRow[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData("published_testimonials", fetchPublishedTestimonials);
  return { rows: data ?? [], loading, error };
}
