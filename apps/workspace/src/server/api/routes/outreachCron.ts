import { Hono } from "hono";

import { runDailyOutreachDigest } from "@/server/outreach/runOutreachNotifications";

import { requireCron } from "../middleware/requireCron";
import type { ApiEnv } from "../types";

/**
 * `GET /api/cron/outreach-windows`.
 *
 * The single authoritative cron tick, now owned by the Workspace (audit §5.5).
 * Auth is the CRON_SECRET contract enforced by `requireCron` (401 when the
 * secret is missing or wrong). It produces exactly ONE Daily Outreach Digest per
 * Bangladesh calendar day (see `runDailyOutreachDigest`): the pg_cron job now
 * fires once daily at 08:00 Asia/Dhaka rather than every minute, and the
 * database-backed daily claim guarantees a repeated/manual tick never
 * double-sends. On success returns the run result with `207` when the digest
 * send failed, `200` otherwise (sent, skipped, or fail-safe no-op).
 *
 * NOTE: moving this endpoint does NOT repoint production traffic. The Supabase
 * `pg_cron` job + its Vault `outreach_cron_endpoint_url` still target the old
 * Website URL and the old per-minute cadence; switching them to
 * `https://workspace.sahinpro.me/...` at `0 2 * * *` is a separate, reversible
 * owner cutover (docs/MONOREPO_CUTOVER_RUNBOOK.md §4 +
 * docs/OUTREACH_DAILY_DIGEST_SCHEDULER_PROPOSAL.sql).
 */
export const outreachCronRoutes = new Hono<ApiEnv>();

outreachCronRoutes.get("/cron/outreach-windows", requireCron, async (c) => {
  const result = await runDailyOutreachDigest(new Date());
  const status = result.failed ? 207 : 200;
  return c.json(result, status);
});
