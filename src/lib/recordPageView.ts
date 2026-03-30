import {
  getSupabaseEdgeFunctionInvokeKey,
  getSupabaseProjectUrl,
} from "@/lib/supabaseFunctions";

/**
 * Sends a page view to the `record-page-view` Edge Function.
 * Uses explicit fetch with JWT anon key — the Functions API expects `Authorization: Bearer <jwt>`;
 * publishable-only keys can return 401 "Missing authorization header".
 * Requires the same secret in Supabase (`ANALYTICS_INGEST_SECRET`) and in the app
 * (`VITE_ANALYTICS_INGEST_SECRET`).
 */
export async function recordPageView(path: string): Promise<void> {
  const base = getSupabaseProjectUrl();
  const key = getSupabaseEdgeFunctionInvokeKey();
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
      const text = await res.text().catch(() => "");
      console.warn("[analytics] record-page-view failed:", res.status, text);
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] record-page-view", e);
    }
  }
}
