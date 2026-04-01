/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  /** New Supabase publishable key (dashboard) */
  readonly VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
  /** Legacy JWT anon key — used if publishable key is unset */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_TURNSTILE_SITE_KEY?: string;
  readonly VITE_ADMIN_EMAIL?: string;
  /** Same value as Supabase secret `ANALYTICS_INGEST_SECRET` (client-visible ingest key). */
  readonly VITE_ANALYTICS_INGEST_SECRET?: string;
  /** Shown in admin sidebar if set; else uses auth metadata or email. */
  readonly VITE_ADMIN_DISPLAY_NAME?: string;
  /** Optional avatar URL in admin sidebar. */
  readonly VITE_ADMIN_AVATAR_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.glb';
declare module '*.png';
