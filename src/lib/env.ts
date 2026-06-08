/**
 * Public env vars for browser + server.
 * Each getter uses static `process.env.NEXT_PUBLIC_*` access so Next.js
 * can inline values into the client bundle at build time.
 */
export const env = {
  get supabaseUrl(): string {
    return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  },
  get supabaseAnonKey(): string {
    return (
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
      ""
    );
  },
  get turnstileSiteKey(): string {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || "";
  },
  get adminEmail(): string | undefined {
    const email = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim().toLowerCase();
    return email || undefined;
  },
  get analyticsIngestSecret(): string {
    return process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET?.trim() || "";
  },
  get adminDisplayName(): string {
    return process.env.NEXT_PUBLIC_ADMIN_DISPLAY_NAME?.trim() || "";
  },
  get adminAvatarUrl(): string {
    return process.env.NEXT_PUBLIC_ADMIN_AVATAR_URL?.trim() || "";
  },
  get isDev(): boolean {
    return process.env.NODE_ENV === "development";
  },
  get isProd(): boolean {
    return process.env.NODE_ENV === "production";
  },
} as const;
