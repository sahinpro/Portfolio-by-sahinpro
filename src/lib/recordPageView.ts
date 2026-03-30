import { getSupabaseBrowserKey, getSupabaseProjectUrl } from "@/lib/supabaseFunctions";

/**
 * Sends a page view to the `record-page-view` Edge Function.
 * Requires the same secret in Supabase (`ANALYTICS_INGEST_SECRET`) and in the app
 * (`VITE_ANALYTICS_INGEST_SECRET`). The value is exposed to the client (similar to a GA measurement ID).
 */
export async function recordPageView(path: string): Promise<void> {
  const base = getSupabaseProjectUrl();
  const key = getSupabaseBrowserKey();
  /** Must match Supabase secret `ANALYTICS_INGEST_SECRET` on `record-page-view`. Set in Vercel at build time as `VITE_ANALYTICS_INGEST_SECRET` (not only in Supabase). */
  const secret = import.meta.env.VITE_ANALYTICS_INGEST_SECRET;
  if (!base || !key || !secret) return;

  try {
    const res = await fetch(`${base}/functions/v1/record-page-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        apikey: key,
        "x-analytics-secret": secret,
      },
      body: JSON.stringify({
        path: path.slice(0, 512),
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer.slice(0, 1024)
            : null,
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent.slice(0, 512)
            : null,
      }),
    });
    if (import.meta.env.DEV && !res.ok) {
      console.warn("[analytics] record-page-view failed:", res.status, await res.text().catch(() => ""));
    }
  } catch {
    /* non-blocking */
  }
}
