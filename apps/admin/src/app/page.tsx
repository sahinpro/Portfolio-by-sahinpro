import { redirect } from "next/navigation";

/**
 * `admin.sahinpro.me/` → the CMS dashboard (plan §2C / runbook entrypoint check).
 *
 * On the single pre-split app the dashboard only ever lived at `/admin`, so this
 * route did not exist. The new domain needs a usable root: a server redirect
 * keeps the `/admin/...` path tree (and its `AdminProtectedLayout` auth gate)
 * exactly as it was instead of duplicating the dashboard at two URLs.
 */
export default function Page() {
  redirect("/admin");
}
