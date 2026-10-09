import type { TestimonialFormValues } from "@/admin/schemas/testimonialFormSchema";
import type { TestimonialRow } from "@/admin/types/database";
import { supabase } from "@/utils/supabase";

export function defaultEmptyTestimonialForm(): TestimonialFormValues {
  return {
    quote: "",
    client_name: "",
    client_role: "",
    client_photo: "",
    project_id: "",
  };
}

export function testimonialRowToFormValues(
  row: TestimonialRow,
): TestimonialFormValues {
  return {
    quote: row.quote ?? "",
    client_name: row.client_name ?? "",
    client_role: row.client_role ?? "",
    client_photo: row.client_photo ?? "",
    project_id: row.project_id ?? "",
  };
}

export function formValuesToTestimonialPayload(
  values: TestimonialFormValues,
): Omit<TestimonialRow, "id" | "created_at"> {
  return {
    quote: values.quote.trim(),
    client_name: values.client_name.trim(),
    client_role: values.client_role.trim() || null,
    client_photo: values.client_photo.trim() || null,
    project_id: values.project_id.trim() || null,
    updated_at: new Date().toISOString(),
  };
}

/** Ensures at most one testimonial points at `projectId`. */
export async function clearOtherAssignments(
  projectId: string,
  exceptId?: string,
): Promise<{ error: string | null }> {
  let query = supabase
    .from("testimonials")
    .update({ project_id: null, updated_at: new Date().toISOString() })
    .eq("project_id", projectId);
  if (exceptId) query = query.neq("id", exceptId);
  const { error } = await query;
  return { error: error?.message ?? null };
}
