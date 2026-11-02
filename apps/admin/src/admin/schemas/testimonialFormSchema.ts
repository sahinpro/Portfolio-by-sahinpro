import { z } from "zod";

export const testimonialFormSchema = z.object({
  quote: z.string().min(1, "Quote is required"),
  client_name: z.string().min(1, "Client name is required"),
  client_role: z.string(),
  client_photo: z.string(),
  project_id: z.string(),
});

export type TestimonialFormValues = z.infer<typeof testimonialFormSchema>;
