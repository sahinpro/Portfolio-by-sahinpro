import { isAllowedAdminEmail } from "@sahinpro/shared/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * Bearer-token admin check for the outreach `/api/admin/*` endpoints.
 *
 * Semantics are identical to the pre-monorepo `api/_lib/adminRouteAuth.ts` the
 * Next.js route handlers used: verify the Supabase access token with an
 * anon/publishable-key client, then apply the `isAllowedAdminEmail` env gate
 * (fail-open when `NEXT_PUBLIC_ADMIN_EMAIL` is unset — the documented audit §10
 * behaviour we deliberately preserve).
 *
 * Deliberately NOT switched to the database `is_admin()` check — DB-only
 * authorization rollout is still deferred (audit blockers B1/B5).
 */
export function extractBearerToken(
  authorizationHeader: string | undefined,
): string {
  const auth = authorizationHeader ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}

export async function isAuthorizedBearerToken(token: string): Promise<boolean> {
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";
  if (!url || !key) return false;

  const supabase = createClient(url, key);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return false;

  return isAllowedAdminEmail(user);
}
