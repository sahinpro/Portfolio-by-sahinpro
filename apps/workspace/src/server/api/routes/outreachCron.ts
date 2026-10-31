import { Hono } from "hono";

import { runOutreachWindowNotifications } from "@/server/outreach/runOutreachNotifications";

import { requireCron } from "../middleware/requireCron";
import type { ApiEnv } from "../types";

/**
 * `GET /api/cron/outreach-windows`.
 *
 * The single authoritative cron tick, now owned by the Workspace (audit §5.5).
 * Auth is the CRON_SECRET contract enforced by `requireCron` (401 when the
 * secret is missing or wrong — which is why the old route's separate 503
 * "CRON_SECRET not configured" branch was already unreachable and is not
 * reproduced). On success returns the run result with `207` when any zone
 * failed, `200` otherwise — the exact status contract the caller expects.
 *
 * NOTE: moving this endpoint does NOT repoint production traffic. The Supabase
 * `pg_cron` job + its Vault `outreach_cron_endpoint_url` still target the old
 * Website URL; switching them to `https://workspace.sahinpro.me/...` is a
 * separate, reversible owner cutover (docs/MONOREPO_CUTOVER_RUNBOOK.md §4).
 */
export const outreachCronRoutes = new Hono<ApiEnv>();

outreachCronRoutes.get("/cron/outreach-windows", requireCron, async (c) => {
  const result = await runOutreachWindowNotifications(new Date());
  const status = result.failed.length > 0 ? 207 : 200;
  return c.json(result, status);
});
