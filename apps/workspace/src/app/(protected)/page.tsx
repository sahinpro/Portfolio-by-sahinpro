import { AdminLeadsListPage } from "@/admin/pages/AdminLeadsListPage";

/**
 * The CRM is the whole app, so the Workspace root IS the Leads board — no
 * `/workspace` prefix and no hand-off redirect. `(protected)/layout.tsx`
 * guards this route: an unauthenticated hit on `/` goes to
 * `/login?from=%2F` and returns to `/` after sign-in. `/leads` stays mounted
 * for deep links (outreach emails, bookmarks) and hosts the add/edit panel
 * routes (`/leads/new`, `/leads/[id]`).
 */
export default function Page() {
  return <AdminLeadsListPage />;
}
