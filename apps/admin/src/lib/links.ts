/**
 * Cross-app production links for the CMS.
 *
 * The defaults are the canonical public origins, so a production build can
 * never render `localhost`: the env overrides only ever exist on local dev
 * deployments. `NEXT_PUBLIC_WEBSITE_URL` points at the Website app
 * (`sahinpro.me`).
 */
export const MAIN_WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.trim().replace(/\/+$/, "") ||
  "https://sahinpro.me";
