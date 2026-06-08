import {
  getSupabaseEdgeFunctionInvokeKey,
  getSupabaseProjectUrl,
} from "@/lib/supabaseFunctions";
import { env } from "@/lib/env";

/**
 * Sends a page view to the `record-page-view` Edge Function.
 */
export async function recordPageView(path: string): Promise<void> {
  const base = getSupabaseProjectUrl();
  const key = getSupabaseEdgeFunctionInvokeKey();
  const secret = env.analyticsIngestSecret;
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
    if (env.isDev && !res.ok) {
      const text = await res.text().catch(() => "");
      console.warn("[analytics] record-page-view failed:", res.status, text);
    }
  } catch (e) {
    if (env.isDev) {
      console.warn("[analytics] record-page-view", e);
    }
  }
}
