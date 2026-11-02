import type { User } from "@supabase/supabase-js";
import { env } from "./env";

/**
 * Application-level admin allowlist gate.
 *
 * Fails CLOSED: a user is authorized only when `NEXT_PUBLIC_ADMIN_EMAIL` is
 * configured AND matches the signed-in user's email (trimmed, case-insensitive).
 * A null user, a user with no email, or a missing/blank allowlist all deny.
 *
 * Supabase RLS stays the separate, data-layer authorization boundary — this
 * helper only guards the app-level admin gate shared by all three applications.
 */
export function isAllowedAdminEmail(user: User | null): boolean {
  if (!user?.email) return false;
  // `env.adminEmail` is already trimmed + lowercased, and returns undefined for
  // an unset, empty or whitespace-only NEXT_PUBLIC_ADMIN_EMAIL.
  const allowlist = env.adminEmail;
  if (!allowlist) return false;
  return user.email.trim().toLowerCase() === allowlist;
}
