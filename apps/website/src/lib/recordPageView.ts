/**
 * Records a public page view via the same-origin API proxy (no direct Supabase call from the browser).
 */
export async function recordPageView(path: string): Promise<void> {
  try {
    await fetch("/api/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: path.slice(0, 512) }),
      keepalive: true,
    });
  } catch {
    // Silent — analytics must not affect Lighthouse or UX.
  }
}
