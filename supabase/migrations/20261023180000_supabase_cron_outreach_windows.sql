-- Supabase Cron (pg_cron + pg_net + Vault) scheduler for outreach-window reminders.
-- Replaces the removed Vercel Hobby cron (* * * * * is not supported on Hobby).
--
-- What this does:
--   1. Ensures pg_net / supabase_vault / pg_cron are available.
--   2. Creates extensions.outreach_cron_tick(): reads the endpoint URL and the
--      CRON_SECRET bearer value from Supabase Vault and queues a GET request via
--      net.http_get with an "Authorization: Bearer <secret>" header. The existing
--      /api/cron/outreach-windows endpoint keeps its current auth contract and
--      still decides (Tue–Thu, 09:30 local + grace, dedupe log) whether to send.
--   3. Schedules ONE named pg_cron job ('outreach-window-reminder-tick') that runs
--      every minute, replacing any previous/duplicate job for this endpoint.
--
-- MANUAL PREREQUISITES (run once in the SQL Editor; hard-fails below if missing):
--   a. If pg_cron is not enabled: Dashboard → Project Settings → Database →
--      Extensions → enable "pg_cron" (or run: create extension pg_cron;).
--      pg_net and supabase_vault ship enabled on Supabase; the CREATE EXTENSION
--      statements below are no-ops when already present.
--   b. Vault secrets (NEVER commit values). If create_secret fails with
--      secrets_name_idx / duplicate key, the name already exists — use
--      vault.update_secret instead (see .env.example outreach section).
--      First-time only:
--        select vault.create_secret(...);
--      When names already exist:
--        select vault.update_secret(
--          (select id from vault.secrets where name = 'outreach_cron_endpoint_url'),
--          'https://www.sahinpro.me/api/cron/outreach-windows',
--          'outreach_cron_endpoint_url',
--          'GET endpoint invoked by pg_cron every minute');
--        select vault.update_secret(
--          (select id from vault.secrets where name = 'outreach_cron_secret'),
--          '<EXACT Vercel CRON_SECRET>',
--          'outreach_cron_secret',
--          'Bearer secret for /api/cron/outreach-windows');
--
-- Security notes:
--   - The tick function lives in `extensions` (not exposed via PostgREST) and is
--     SECURITY DEFINER with a pinned empty search_path; EXECUTE is granted only
--     to the superuser-equivalent maintenance roles (postgres / supabase_admin),
--     revoked from PUBLIC, anon, authenticated and service_role. Application
--     roles therefore cannot read Vault secrets nor call the tick function.
--   - pg_net queues requests in its http_request_queue table (schema `net` or
--     `extensions`, depending on the project) with headers in plain rows until
--     the worker sends them; Supabase does not support changing grants on those
--     pg_net tables (platform constraint). Any role that can DIRECTLY log in to
--     the database can briefly read the queued bearer header, so keep the
--     anon/authenticated/service_role keys out of direct-connection reach and
--     never expose the pg_net schema through PostgREST.
--   - The endpoint returns 200/207/401/503; pg_net records the response in its
--     _http_response table. Failed or skipped ticks are naturally retried inside
--     the endpoint's existing 4-minute grace window, and the
--     outreach_window_notifications unique log prevents duplicates.

-- ---------------------------------------------------------------------------
-- 1. Extensions
-- ---------------------------------------------------------------------------
create extension if not exists supabase_vault;

-- pg_net is pre-installed on Supabase projects, but its schema varies
-- (`extensions` on this project, `net` on newer ones). Never force
-- `with schema net`: if the extension already exists elsewhere, Postgres
-- aborts with "schema net is not a member of extension pg_net". Only create
-- it when genuinely absent; the tick function resolves the real schema from
-- the catalog at runtime either way.
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    execute 'create extension pg_net with schema extensions';
  end if;
end;
$$;

-- Remove the orphan `net` schema left by an earlier revision of this
-- migration, but only when it is empty and not owned by pg_net.
do $$
begin
  if to_regnamespace('net') is not null
     and not exists (
       select 1
       from pg_extension e
       join pg_namespace n on n.oid = e.extnamespace
       where e.extname = 'pg_net' and n.nspname = 'net')
     and not exists (
       select 1 from pg_class where relnamespace = 'net'::regnamespace)
  then
    execute 'drop schema "net"';
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 2. Tick function: Vault -> pg_net http_get(Authorization: Bearer <secret>)
-- ---------------------------------------------------------------------------
create schema if not exists extensions;

create or replace function extensions.outreach_cron_tick()
returns bigint
language plpgsql
security definer
set search_path = ''
as $fn$
declare
  v_url        text;
  v_secret     text;
  v_net_schema text;
  v_request_id bigint;
begin
  select n.nspname
    into v_net_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_net';

  if v_net_schema is null then
    raise exception 'outreach_cron_tick: pg_net extension is not installed';
  end if;

  select ds.decrypted_secret into v_url
  from vault.decrypted_secrets ds
  where ds.name = 'outreach_cron_endpoint_url';

  select ds.decrypted_secret into v_secret
  from vault.decrypted_secrets ds
  where ds.name = 'outreach_cron_secret';

  if v_url is null or v_secret is null or btrim(v_secret) = '' then
    raise exception
      'outreach_cron_tick: vault secrets outreach_cron_endpoint_url / outreach_cron_secret are not configured';
  end if;

  -- Headers keep the endpoint's existing auth contract (Authorization: Bearer).
  -- Never log or return the secret; only the pg_net request id is returned.
  execute format('select %I.http_get(url := $1, headers := $2::jsonb)', v_net_schema)
    into v_request_id
    using v_url,
          jsonb_build_object('Authorization', 'Bearer ' || btrim(v_secret));

  return v_request_id;
end;
$fn$;

-- Only DB maintenance roles may run the tick (pg_cron executes as the role that
-- scheduled the job). App roles and PUBLIC get nothing; PostgREST cannot reach it.
revoke all on function extensions.outreach_cron_tick() from public, anon, authenticated, service_role;
grant execute on function extensions.outreach_cron_tick() to postgres, supabase_admin;

-- ---------------------------------------------------------------------------
-- 3. Schedule exactly one named job (idempotent: cron.schedule upserts by name,
--    legacy duplicates pointing at this endpoint are unscheduled first)
-- ---------------------------------------------------------------------------
do $sched$
declare
  v_cron_schema text;
  v_job_name    constant text := 'outreach-window-reminder-tick';
  rec           record;
begin
  select n.nspname
    into v_cron_schema
  from pg_extension e
  join pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pg_cron';

  if v_cron_schema is null then
    begin
      execute 'create extension pg_cron with schema extensions';
    exception when others then
      raise exception
        'pg_cron is not available on this project (%). Enable it manually: '
        'Dashboard -> Project Settings -> Database -> Extensions -> pg_cron, '
        'then re-run this migration.', sqlerrm;
    end;

    select n.nspname
      into v_cron_schema
    from pg_extension e
    join pg_namespace n on n.oid = e.extnamespace
    where e.extname = 'pg_cron';
  end if;

  -- Replace, don't duplicate: drop any other job already targeting this tick
  -- or the outreach endpoint (e.g. an unnamed earlier attempt).
  for rec in
    execute format(
      'select jobid from %I.job where jobname <> $1 and (command ilike $2 or command ilike $3)',
      v_cron_schema
    )
    using v_job_name, '%outreach_cron_tick%', '%api/cron/outreach-windows%'
  loop
    execute format('select %I.unschedule($1)', v_cron_schema) using rec.jobid;
  end loop;

  -- Replace any prior run of this migration (pg_cron errors on duplicate job names).
  begin
    execute format('select %I.unschedule($1)', v_cron_schema) using v_job_name;
  exception
    when others then null;
  end;

  execute format('select %I.schedule($1, $2, $3)', v_cron_schema)
    using v_job_name, '* * * * *', 'select extensions.outreach_cron_tick()';
end;
$sched$;

-- ---------------------------------------------------------------------------
-- 4. Soft check: warn (not fail) if Vault secrets are still missing.
--    Until they exist, the job logs an exception each minute instead of sending.
-- ---------------------------------------------------------------------------
do $check$
declare
  v_missing text[];
begin
  select array_agg(s.name) into v_missing
  from (values ('outreach_cron_endpoint_url'), ('outreach_cron_secret')) s(name)
  where not exists (select 1 from vault.secrets where name = s.name);

  if v_missing is not null then
    raise notice
      'SUPABASE CRON NOT ACTIVE YET: create the following Vault secrets manually: %',
      array_to_string(v_missing, ', ');
  end if;
end;
$check$;
