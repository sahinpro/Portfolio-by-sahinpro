/**
 * Minimal HTML helpers for the outreach email body.
 *
 * The Website owns the full contact-email template (`api/_lib/html.ts` on www),
 * but the outreach reminder only ever needs an HTML escaper, so this app keeps a
 * deliberately tiny copy rather than importing SEO/contact code across the app
 * boundary. Kept byte-identical to the website's `escapeHtml` so rendered output
 * is unchanged.
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}
