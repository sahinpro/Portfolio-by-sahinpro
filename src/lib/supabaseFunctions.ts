/** Anon / publishable key for calling Edge Functions from the browser. */
export function getSupabaseBrowserKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    ""
  );
}

export function getSupabaseProjectUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
}

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(getSupabaseProjectUrl() && getSupabaseBrowserKey());
}
