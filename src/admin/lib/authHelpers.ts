import type { User } from "@supabase/supabase-js";

const adminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();

/** When set, only this email may use /admin after sign-in. */
export function isAllowedAdminEmail(user: User | null): boolean {
  if (!user?.email) return false;
  if (!adminEmail) return true;
  return user.email.toLowerCase() === adminEmail;
}
