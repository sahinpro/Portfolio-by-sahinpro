import { isAllowedAdminEmail } from "@sahinpro/shared/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * Bearer-token admin check for this app's `/api/admin/*` endpoints.
 *
 * Ported verbatim from the pre-monorepo `src/app/api/admin/flush-cache/route.ts`
 * so the authorization semantics stay identical on the new origin: verify the
 * Supabase access token with an anon/publishable-key client, then apply the
 * `isAllowedAdminEmail` env gate. The session lives in this app's own origin,
 * so the token the CMS browser sends is the one this server can verify.
 *
 * Deliberately NOT switched to the database `is_admin()` check — the owner
 * cutover for DB-only authorization is still pending (audit blockers B1/B5,
 * §10.2). Fail-closed on every missing/invalid input, exactly as before.
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
