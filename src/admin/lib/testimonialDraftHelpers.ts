export type TestimonialFormState = {
  author_name: string;
  author_role: string;
  author_company: string;
  author_avatar: string;
  quote: string;
  highlighted_quote: string;
  status: "draft" | "published";
  sort_order: number;
};

export function testimonialFormsEqual(a: TestimonialFormState, b: TestimonialFormState): boolean {
  return (
    a.author_name === b.author_name &&
    a.author_role === b.author_role &&
    a.author_company === b.author_company &&
    a.author_avatar === b.author_avatar &&
    a.quote === b.quote &&
    a.highlighted_quote === b.highlighted_quote &&
    a.status === b.status &&
    a.sort_order === b.sort_order
  );
}

export function shouldPersistNewTestimonialDraft(
  current: TestimonialFormState,
  openedBaseline: TestimonialFormState,
): boolean {
  return !testimonialFormsEqual(current, openedBaseline);
}

export function canLenientTestimonialDraftInsert(s: TestimonialFormState): boolean {
  return s.author_name.trim().length > 0 && s.quote.trim().length > 0;
}

/** DB row shape for insert/update (trimmed). */
export function testimonialToPayload(
  form: TestimonialFormState,
  opts?: { forceDraft?: boolean },
): {
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar: string | null;
  quote: string;
  highlighted_quote: string | null;
  status: TestimonialFormState["status"];
  sort_order: number;
} {
  return {
    author_name: form.author_name.trim(),
    author_role: form.author_role.trim() || null,
    author_company: form.author_company.trim() || null,
    author_avatar: form.author_avatar.trim() || null,
    quote: form.quote.trim(),
    highlighted_quote: form.highlighted_quote.trim() || null,
    status: opts?.forceDraft ? "draft" : form.status,
    sort_order: form.sort_order,
  };
}
