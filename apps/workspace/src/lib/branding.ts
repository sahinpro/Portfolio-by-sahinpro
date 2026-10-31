/**
 * Workspace-side brand assets.
 *
 * Like the CMS, the CRM only ever needs a local asset path — it must not import
 * the website's SEO image map across the app boundary.
 */

/** Sidebar avatar. Same value the pre-split `PROFILE_AVATAR.path` used. */
export const WORKSPACE_AVATAR_PATH =
  process.env.NEXT_PUBLIC_ADMIN_AVATAR_URL?.trim() || "/sahin.jpg";
