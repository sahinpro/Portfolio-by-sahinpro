import { Hono } from "hono";
import type { ApiEnv } from "../types";

/**
 * Server-side page-view proxy to the `record-page-view` Supabase Edge Function.
 * The edge function itself is unchanged; this only forwards to it.
 *
 * Always answers 204 and never surfaces an error: analytics must not affect UX
 * or the Lighthouse best-practices score.
 */
function getAnalyticsSecret(): string {
  return (
    process.env.ANALYTICS_INGEST_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET?.trim() ||
    ""
  );
}

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") || "";
}

function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    ""
  );
}

export const pageviewRoutes = new Hono<ApiEnv>().post(
  "/pageview",
  async (c) => {
    try {
      const base = getSupabaseUrl();
      const key = getSupabaseKey();
      const secret = getAnalyticsSecret();
      if (!base || !key || !secret) {
        return c.body(null, 204);
      }

      const body = (await c.req.json().catch(() => ({}))) as { path?: string };
      const path =
        typeof body.path === "string" && body.path.length > 0
          ? body.path.slice(0, 512)
          : "/";

      await fetch(`${base}/functions/v1/record-page-view`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
          "x-analytics-secret": secret,
        },
        body: JSON.stringify({
          path,
          referrer: c.req.header("referer")?.slice(0, 1024) ?? null,
          userAgent: c.req.header("user-agent")?.slice(0, 512) ?? null,
        }),
      });
    } catch {
      // Analytics must never affect UX or Lighthouse best-practices score.
    }

    return c.body(null, 204);
  },
);
