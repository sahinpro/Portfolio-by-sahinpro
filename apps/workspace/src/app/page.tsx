import { redirect } from "next/navigation";

/**
 * The CRM is the whole app; `/` immediately hands off to the leads board.
 * `WorkspaceProtectedLayout` still guards `/leads`, so an unauthenticated hit
 * here lands on `/leads`, which redirects to `/login` with the original `from`.
 */
export default function Page() {
  redirect("/leads");
}
