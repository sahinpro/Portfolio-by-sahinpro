-- ===========================================================================
-- PROPOSAL — NOT EXECUTED. Owner review + manual run only.
-- ===========================================================================
--
-- Purpose: replace the high-frequency outreach scheduler with ONE daily
-- execution at 08:00 Bangladesh time (Asia/Dhaka), now that the endpoint emits
-- a single Daily Outreach Digest instead of a per-city email per tick.
--
-- WHY THIS IS CODE-SAFE EVEN BEFORE YOU RUN IT
--   The application already refuses to send more than one digest per Bangladesh
--   calendar day: `runDailyOutreachDigest` reserves an atomic daily claim in the
--   existing `outreach_window_claims` table (keyed on a synthetic
--   `digest/asia-dhaka` zone + the BD date). So if the job keeps firing at the
--   old `*/3 * * * *` cadence, only the first tick of a BD day sends and the
--   rest skip. This reschedule is therefore about removing the idle write churn
--   (cron.job_run_details + pg_net rows), NOT about preventing double emails.
--   It also does not require any schema change: no new table, column or policy.
--
-- TIMEZONE — VERIFY FIRST
--   pg_cron interprets its schedule in the value of `cron.timezone`. Supabase
--   projects default to UTC. CONFIRM the live setting before choosing the
--   expression (read-only):
--
--       show cron.timezone;
--
--   * If it is UTC (the Supabase default)  → use  `0 2 * * *`  (02:00 UTC = 08:00 BD).
--   * If it is already 'Asia/Dhaka'        → use  `0 8 * * *`.
--   Do NOT change the database timezone; just pick the expression to match.
--   Asia/Dhaka has no DST, so 08:00 BD is a constant 02:00 UTC year-round.
--
-- IDEMPOTENT: cron.schedule() UPSERTs by job name, so re-running just re-applies
-- the same daily cadence to the SAME job. Additive only — no tables, policies,
-- Vault secrets or rows are altered. It never touches the existing named job
-- 'outreach-window-reminder-tick' other than rescheduling it.
-- ===========================================================================

do $sched$
declare
  v_cron_schema text;
  v_job_name    constant text := 'outreach-window-reminder-tick';
  v_command     constant text := 'select extensions.outreach_cron_tick()';
  -- 02:00 UTC == 08:00 Asia/Dhaka. CHANGE to '0 8 * * *' only if
  -- `show cron.timezone;` returned 'Asia/Dhaka'.
  v_schedule    constant text := '0 2 * * *';
begin
  -- Resolve the schema from pg_proc (where schedule() is defined), NOT from
  -- pg_extension.extnamespace: on Supabase the extension namespace is reported
  -- as pg_catalog while the function actually lives in `cron`. Trusting
  -- extnamespace builds a bogus pg_catalog.schedule(...) and fails with 42883.
  select n.nspname
    into v_cron_schema
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where p.proname = 'schedule'
    and p.pronargs = 3
  order by n.nspname
  limit 1;

  if v_cron_schema is null then
    raise exception
      'pg_cron schedule(job_name, schedule, command) not found; is pg_cron installed?';
  end if;

  execute format('select %I.schedule($1, $2, $3)', v_cron_schema)
    using v_job_name, v_schedule, v_command;

  raise notice 'outreach cron "%" rescheduled to %', v_job_name, v_schedule;
end;
$sched$;

-- Post-change read-only verification (record schedule + job count only):
--   select jobid, jobname, schedule from <cron_schema>.job
--     where jobname = 'outreach-window-reminder-tick';
-- Expect exactly ONE job with the daily schedule above.
--
-- ROLLBACK: to restore the previous cadence, re-run the block above with
--   v_schedule := '*/3 * * * *';
-- (safe — the daily claim still guarantees at most one digest per BD day).
--
-- Disk I/O note: this proposal reduces the tick count from 480/day (*/3) to
-- 1/day, which cuts the cron.job_run_details + pg_net write churn that feeds
-- the free-tier Disk I/O warning. It is NOT claimed to by itself clear the
-- warning; other background writes may contribute. The owner must verify the
-- Disk I/O Budget and database metrics after applying. Do NOT delete
-- cron.job_run_details history as part of this change.
