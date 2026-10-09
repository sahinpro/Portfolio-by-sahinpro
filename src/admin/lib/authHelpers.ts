import { env } from "@/lib/env";
import type { User } from "@supabase/supabase-js";

/** When set, only this email may use /admin after sign-in. */
export function isAllowedAdminEmail(user: User | null): boolean {
  if (!user?.email) return false;
  if (!env.adminEmail) return true;
  return user.email.toLowerCase() === env.adminEmail;
}
