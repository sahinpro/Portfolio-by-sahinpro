import { getSupabaseBrowserKey, getSupabaseProjectUrl } from "@/lib/supabaseFunctions";
import { supabase } from "@/utils/supabase";

/**
 * Sends a page view to the `record-page-view` Edge Function.
 * Uses `supabase.functions.invoke` so auth matches the JS client (publishable + legacy anon keys).
 * Requires the same secret in Supabase (`ANALYTICS_INGEST_SECRET`) and in the app
 * (`VITE_ANALYTICS_INGEST_SECRET`).
 */
export async function recordPageView(path: string): Promise<void> {
  const base = getSupabaseProjectUrl();
  const key = getSupabaseBrowserKey();
  const secret = import.meta.env.VITE_ANALYTICS_INGEST_SECRET;
  if (!base || !key || !secret) return;

  try {
    const { error } = await supabase.functions.invoke("record-page-view", {
      body: {
        path: path.slice(0, 512),
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer.slice(0, 1024)
            : null,
        userAgent:
          typeof navigator !== "undefined"
            ? navigator.userAgent.slice(0, 512)
            : null,
      },
      headers: {
        "x-analytics-secret": secret,
      },
    });
    if (import.meta.env.DEV && error) {
      console.warn("[analytics] record-page-view failed:", error.message);
    }
  } catch (e) {
    if (import.meta.env.DEV) {
      console.warn("[analytics] record-page-view", e);
    }
  }
}
