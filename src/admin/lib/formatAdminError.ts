/** Appends a short hint when Supabase RLS blocks a write. */
export function withRlsHint(message: string): string {
  if (!/row-level security/i.test(message)) return message;
  return `${message} Add your user id to public.admin_allowlist (see supabase/README).`;
}
