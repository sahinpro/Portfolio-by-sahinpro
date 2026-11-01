import { createMiddleware } from "hono/factory";

import { logServerEvent } from "../lib/logger";
import type { ApiEnv } from "../types";

/**
 * Authorize scheduled invocations (Supabase pg_cron via pg_net, or manual calls)
 * with the CRON_SECRET bearer/header contract. Ported verbatim from the
 * pre-monorepo `api/_lib/cronAuth.ts` so the header contract is unchanged:
 * `Authorization: Bearer <CRON_SECRET>` OR `x-cron-secret: <CRON_SECRET>`.
 * Missing CRON_SECRET always denies (fail-closed) — the middleware answers
 * `401 Unauthorized`, exactly as the pre-monorepo route did: its old separate
 * 503 "CRON_SECRET not configured" branch was unreachable because
 * `isCronAuthorized` already returned false (→ 401) when the secret was unset.
 */
export function isCronAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization") ?? "";
  if (auth === `Bearer ${secret}`) return true;

  const header = request.headers.get("x-cron-secret")?.trim();
  return header === secret;
}

export const requireCron = createMiddleware<ApiEnv>(async (c, next) => {
  if (!isCronAuthorized(c.req.raw)) {
    logServerEvent("warn", "api_cron_unauthorized", {
      requestId: c.get("requestId"),
      path: c.req.path,
    });
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
