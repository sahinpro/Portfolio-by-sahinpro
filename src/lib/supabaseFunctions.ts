/** Anon / publishable key for calling Edge Functions from the browser. */
export function getSupabaseBrowserKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    ""
  );
}

/**
 * JWT anon key is required by the Edge Functions gateway for `Authorization: Bearer`.
 * Prefer this over publishable keys for `/functions/v1/*` to avoid "Missing authorization header".
 */
export function getSupabaseEdgeFunctionInvokeKey(): string {
  return (
    import.meta.env.VITE_SUPABASE_ANON_KEY ??
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY ??
    ""
  );
}

export function getSupabaseProjectUrl(): string {
  return (import.meta.env.VITE_SUPABASE_URL ?? "").replace(/\/$/, "");
}

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(getSupabaseProjectUrl() && getSupabaseBrowserKey());
}
