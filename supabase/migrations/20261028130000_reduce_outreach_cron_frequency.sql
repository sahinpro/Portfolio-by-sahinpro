-- ---------------------------------------------------------------------------
-- Reduce outreach cron frequency to cut free-tier Disk I/O budget usage.
-- ---------------------------------------------------------------------------
-- Context:
--   20261023180000_supabase_cron_outreach_windows.sql scheduled the named job
--   'outreach-window-reminder-tick' at '* * * * *' (EVERY MINUTE). Each tick
--   writes a cron.job_run_details row (+ a later UPDATE), queues a pg_net
--   http_request_queue row, and logs a net._http_response row — roughly
--   5,700 writes/day of background churn even with zero traffic. pg_stat_statements
--   confirmed these are the top block-dirtying statements, which is what trips
--   the Supabase free-tier "about to deplete its Disk I/O Budget" warning.
--
-- Why every 3 minutes is safe:
--   The endpoint only actually sends during Tue-Thu 09:30 local per zone, with a
--   graceMinutes = 4 window to tolerate scheduler jitter (see
--   api/_lib/outreach/scheduleConfig.ts). A 3-minute tick stays UNDER that 4-minute
--   grace, so no reminder can be missed; the outreach_window_claims unique log
--   still guarantees exactly-once per zone/day. Day-of-week is intentionally NOT
--   restricted because configured zones span the globe (a UTC weekday is not the
--   same local weekday), so we keep the daily cadence and only widen the interval.
--
-- Effect: ~67% fewer ticks/day (1,440 -> 480) and proportionally less write churn.
--
-- Idempotent: cron.schedule() UPSERTs by job name, so re-running just re-applies
-- the same schedule. Additive only — no tables, policies or rows are altered.
-- ---------------------------------------------------------------------------

-- NOTE: resolve the schema from pg_proc (where schedule() is actually defined),
-- NOT from pg_extension.extnamespace. On Supabase, pg_cron's extnamespace is
-- reported as `pg_catalog` while the schedule()/unschedule() functions really
-- live in the `cron` schema -- trusting extnamespace would build a bogus
-- `pg_catalog.schedule(...)` call and fail with 42883 "function does not exist".
do $sched$
declare
  v_cron_schema text;
  v_job_name    constant text := 'outreach-window-reminder-tick';
  v_command     constant text := 'select extensions.outreach_cron_tick()';
  v_schedule    constant text := '*/3 * * * *';
begin
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

  -- Upsert the existing named job with the slower cadence.
  execute format('select %I.schedule($1, $2, $3)', v_cron_schema)
    using v_job_name, v_schedule, v_command;

  raise notice 'outreach cron "%" rescheduled to %', v_job_name, v_schedule;
end;
$sched$;
