import { createClient } from "@supabase/supabase-js";

function getBearerToken(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}

/** Mirrors src/app/api/admin/flush-cache admin check. */
export async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const token = getBearerToken(request);
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
  if (error || !user?.email) return false;

  const allowed = process.env.NEXT_PUBLIC_ADMIN_EMAIL?.trim();
  if (!allowed) return true;
  return user.email.toLowerCase() === allowed.toLowerCase();
}
