import path from "node:path";
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
 *
 * Trimmed against the website: the CMS has no contact form (no Turnstile, no
 * Resend) and no page-view ingestion (no analytics ingest secret).
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
    NEXT_PUBLIC_ADMIN_DISPLAY_NAME: pick(
      "NEXT_PUBLIC_ADMIN_DISPLAY_NAME",
      "VITE_ADMIN_DISPLAY_NAME",
    ),
    NEXT_PUBLIC_ADMIN_AVATAR_URL: pick(
      "NEXT_PUBLIC_ADMIN_AVATAR_URL",
      "VITE_ADMIN_AVATAR_URL",
    ),
    NEXT_PUBLIC_SUPABASE_STORAGE_QUOTA_GB: pick(
      "NEXT_PUBLIC_SUPABASE_STORAGE_QUOTA_GB",
      "VITE_SUPABASE_STORAGE_QUOTA_GB",
    ),
  }).filter(([, value]) => value.length > 0),
);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: publicEnv,
  /** `@sahinpro/shared` ships TypeScript source, so it must be compiled here. */
  transpilePackages: ["@sahinpro/shared"],
  /**
   * Workspace packages live above the app directory. Without the monorepo root
   * as the tracing root, Vercel's serverless bundle misses `@sahinpro/shared`.
   */
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Media library + project/testimonial cover previews.
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

export default nextConfig;
