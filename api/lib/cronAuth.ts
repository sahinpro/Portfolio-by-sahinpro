/**
 * Authorize scheduled invocations (Supabase pg_cron via pg_net, or manual calls)
 * with the CRON_SECRET bearer/header contract.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization") ?? "";
  if (auth === `Bearer ${secret}`) return true;

  const header = request.headers.get("x-cron-secret")?.trim();
  return header === secret;
}
