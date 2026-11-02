/**
 * Cross-app production links for the CMS.
 *
 * The defaults are the canonical public origins, so a production build can
 * never render `localhost`: the env overrides only ever exist on local dev
 * deployments. `NEXT_PUBLIC_WEBSITE_URL` points at the Website app
 * (`sahinpro.me`); `NEXT_PUBLIC_WORKSPACE_URL` at the Lead CRM Workspace
 * (`workspace.sahinpro.me`).
 */
export const MAIN_WEBSITE_URL =
  process.env.NEXT_PUBLIC_WEBSITE_URL?.trim().replace(/\/+$/, "") ||
  "https://sahinpro.me";

/** Deep link to the Workspace Leads board (the old CMS `/admin/leads` home). */
export const WORKSPACE_LEADS_URL = process.env.NEXT_PUBLIC_WORKSPACE_URL?.trim()
  ? `${process.env.NEXT_PUBLIC_WORKSPACE_URL.trim().replace(/\/+$/, "")}/leads`
  : "https://workspace.sahinpro.me/leads";
