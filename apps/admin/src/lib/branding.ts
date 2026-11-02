/**
 * Admin-side brand assets.
 *
 * The website owns the SEO image map (`src/lib/seoImages.ts` on www) with its
 * absolute URLs and descriptive alt text; the CMS only ever needs a local asset
 * path, so it gets this deliberately tiny file instead of importing SEO code
 * across the app boundary.
 */

/**
 * Sidebar avatar. Same value as the pre-split `PROFILE_AVATAR.path`
 * (`/sahin.jpg`, served from this app's own `public/`), with the optional
 * env override applied first.
 */
export const ADMIN_AVATAR_PATH =
  process.env.NEXT_PUBLIC_ADMIN_AVATAR_URL?.trim() || "/sahin.jpg";
