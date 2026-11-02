import type { Metadata } from "next";

/**
 * Workspace (Lead CRM) metadata — app-owned, not the website's SEO builder.
 *
 * The CRM lives on its own origin (workspace.sahinpro.me) and must never be
 * indexed. Indexing is refused in three intentional layers, mirroring the CMS:
 *  - this per-route metadata (`noindex, nofollow`) — what the HTML advertises;
 *  - `X-Robots-Tag: noindex, nofollow` for every path in `vercel.json` — what a
 *    crawler that ignores HTML sees on this app's own root path;
 *  - `disallow: /` in this app's `public/robots.txt`.
 */
export const workspaceMetadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Workspace",
};
