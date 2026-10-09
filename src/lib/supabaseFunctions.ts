import { env } from "@/lib/env";

/** Anon / publishable key for calling Edge Functions from the browser. */
export function getSupabaseBrowserKey(): string {
  return env.supabaseAnonKey;
}

/**
 * JWT anon key is required by the Edge Functions gateway for `Authorization: Bearer`.
 * Prefer this over publishable keys for `/functions/v1/*` to avoid "Missing authorization header".
 */
export function getSupabaseEdgeFunctionInvokeKey(): string {
  return env.supabaseAnonKey;
}

export function getSupabaseProjectUrl(): string {
  return env.supabaseUrl.replace(/\/$/, "");
}

export function isSupabaseBrowserConfigured(): boolean {
  return Boolean(getSupabaseProjectUrl() && getSupabaseBrowserKey());
}
