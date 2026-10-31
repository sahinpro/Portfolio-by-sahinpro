import type { Metadata } from "next";

/**
 * Admin metadata — app-owned, not the website's SEO builder.
 *
 * The values are the ones `adminMetadata` carried on the single app
 * (`robots: { index: false, follow: false }`, title `Admin`); the `@/lib/metadata`
 * module it used to live in belongs to the public site and must not be reached
 * across the app boundary.
 *
 * Indexing is refused in three places now, all of them intentional:
 *  - this per-route metadata (`noindex, nofollow`) — what the HTML advertises;
 *  - `X-Robots-Tag: noindex, nofollow` for every path in `vercel.json` — what a
 *    crawler that ignores HTML sees; the website's rule only covered `/admin/*`,
 *    which is not this app's root path on its own domain;
 *  - `disallow: /` in this app's `public/robots.txt`.
 *
 * The website's own `robots.txt` still disallows `/admin/` for the old URL space;
 * changing it is an owner cutover action (docs/MONOREPO_CUTOVER_RUNBOOK.md), not
 * part of this directory move.
 */
export const adminMetadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};
