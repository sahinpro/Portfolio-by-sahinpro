import type { TestimonialRow } from "@/admin/types/database";
import { fetchTestimonials } from "@/data/publicSupabase.client";
import {
  mapTestimonialRowToPublic,
  type PublicTestimonial,
} from "@/data/projectUiMapper";
import { usePublicData } from "@/hooks/usePublicData";
import { useMemo } from "react";

export function usePublicTestimonials(initialRows?: TestimonialRow[] | null): {
  testimonials: PublicTestimonial[];
  loading: boolean;
  error: Error | null;
} {
  const { data, loading, error } = usePublicData(
    "public_testimonials",
    fetchTestimonials,
    { initialData: initialRows ?? null },
  );
  const testimonials = useMemo(
    () =>
      (data ?? [])
        .map(mapTestimonialRowToPublic)
        .filter((item): item is PublicTestimonial => Boolean(item)),
    [data],
  );
  return { testimonials, loading, error };
}
