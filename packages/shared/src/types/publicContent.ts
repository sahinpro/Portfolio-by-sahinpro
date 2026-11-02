import type { ProjectTestimonial } from "./database";

/**
 * Testimonial shape rendered by the public site and the CMS preview card.
 *
 * Moved out of the website UI mapper so `ProjectTestimonialCard` stays
 * app-neutral (shared must not import application code).
 */
export type PublicTestimonial = {
  id?: string;
  quote: string;
  clientName: string;
  clientRole?: string;
  clientPhoto?: string;
};

/** Testimonial row → public shape. Column-free: only reads the raw JSON value. */
export function toPublicTestimonial(
  parsed: ProjectTestimonial | null,
  id?: string,
): PublicTestimonial | null {
  if (!parsed) return null;
  return {
    ...(id ? { id } : {}),
    quote: parsed.quote,
    clientName: parsed.client_name,
    ...(parsed.client_role ? { clientRole: parsed.client_role } : {}),
    ...(parsed.client_photo ? { clientPhoto: parsed.client_photo } : {}),
  };
}
