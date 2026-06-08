import type { NextConfig } from "next";

/** Resolve first non-empty env var (evaluated when Next.js loads this config). */
function pick(...keys: string[]): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return "";
}

/**
 * Map legacy VITE_* names to NEXT_PUBLIC_* for Vercel builds.
 * Only non-empty values are injected — empty strings would override .env
 * and break `??` fallbacks in the Supabase client.
 */
const publicEnv = Object.fromEntries(
  Object.entries({
    NEXT_PUBLIC_SUPABASE_URL: pick("NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL"),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: pick(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
    ),
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: pick(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      "VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
      "NEXT_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
    ),
    NEXT_PUBLIC_ADMIN_EMAIL: pick("NEXT_PUBLIC_ADMIN_EMAIL", "VITE_ADMIN_EMAIL"),
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: pick(
      "NEXT_PUBLIC_TURNSTILE_SITE_KEY",
      "VITE_TURNSTILE_SITE_KEY",
      "NEXT_TURNSTILE_SITE_KEY",
    ),
    NEXT_PUBLIC_ANALYTICS_INGEST_SECRET: pick(
      "NEXT_PUBLIC_ANALYTICS_INGEST_SECRET",
      "VITE_ANALYTICS_INGEST_SECRET",
    ),
    NEXT_PUBLIC_ADMIN_DISPLAY_NAME: pick(
      "NEXT_PUBLIC_ADMIN_DISPLAY_NAME",
      "VITE_ADMIN_DISPLAY_NAME",
    ),
    NEXT_PUBLIC_ADMIN_AVATAR_URL: pick(
      "NEXT_PUBLIC_ADMIN_AVATAR_URL",
      "VITE_ADMIN_AVATAR_URL",
    ),
  }).filter(([, value]) => value.length > 0),
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: publicEnv,
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.glb$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
