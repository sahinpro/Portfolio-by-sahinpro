/** Appends a short hint when Supabase RLS blocks a write. */
export function withRlsHint(message: string): string {
  if (!/row-level security/i.test(message)) return message;
  return `${message} Add your user id to public.admin_allowlist (see supabase/README).`;
}

/** Pulls PostgREST `message` / `details` / `hint` into one string for toasts. */
export function formatSupabaseUserMessage(error: unknown, fallback = "Request failed"): string {
  if (error && typeof error === "object") {
    const o = error as { message?: string; details?: string; hint?: string };
    const parts = [o.message, o.details, o.hint].filter(
      (x): x is string => typeof x === "string" && x.length > 0,
    );
    const deduped = parts.filter((p, i) => parts.indexOf(p) === i);
    if (deduped.length) return deduped.join(" — ");
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
