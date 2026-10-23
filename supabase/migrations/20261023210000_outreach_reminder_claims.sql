-- Atomic outreach reminder claims (server / service role only).
--
-- Business rule: at most ONE successful production reminder per IANA time
-- zone per local date, regardless of later edits to the configured reminder
-- time (window_start).
--
-- Why a new table instead of altering outreach_window_notifications:
--   * The existing unique key (iana_timezone, local_date, window_start) is
--     part of the delivery-history table; changing it to (iana_timezone,
--     local_date) would collide with legacy rows (multiple window_start
--     values per zone/date, plus multiple 'failed' retry rows) and would
--     require DELETE-ing preserved history — explicitly out of scope.
--   * The cron previously did read-then-send against the log, which raced
--     across concurrent ticks and failed OPEN on query errors.
--   * An insert-or-ignore reservation is atomic at the primary key level:
--     concurrent ticks cannot both win the slot for the same zone/date.
--
-- Semantics used by api/_lib/outreach/reminderClaim.ts:
--   * INSERT ... ON CONFLICT DO NOTHING wins the slot  -> send now
--   * INSERT deduplicated (row exists)                  -> already sent, skip
--   * INSERT errors (e.g. this migration not applied)   -> fail safe, no send
--   * Send failed -> the claim row is DELETEd so the next cron tick retries.
--   * Send succeeded -> the claim row stays forever (that date can never
--     re-send, even if the admin edits the reminder time afterwards).
--
-- This migration sends no email and calls no HTTP endpoint. It creates the
-- table and then backfills one claim per (zone, date) that already has a
-- 'sent' history row — so legacy duplicate sent records (which broke the old
-- single-row dedupe read) are converted into guards instead of being
-- deleted. The outreach_window_notifications history is preserved untouched.

CREATE TABLE IF NOT EXISTS public.outreach_window_claims (
  iana_timezone text NOT NULL,
  local_date date NOT NULL,
  -- Recorded for operator context only; deliberately NOT part of the key.
  window_start text NOT NULL DEFAULT '09:30',
  claimed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT outreach_window_claims_pkey PRIMARY KEY (iana_timezone, local_date)
);

-- One-time backfill: for every (zone, local date) that already received a
-- successful reminder, reserve its claim so the same date can never re-send,
-- even on the migration day itself. Multiple legacy 'sent' rows for the same
-- zone/date collapse to a single claim (earliest sent_at wins); nothing in
-- the history table is modified.
INSERT INTO public.outreach_window_claims (iana_timezone, local_date, window_start, claimed_at)
SELECT DISTINCT ON (iana_timezone, local_date)
  iana_timezone,
  local_date,
  window_start,
  COALESCE(sent_at, created_at)
FROM public.outreach_window_notifications
WHERE status = 'sent'
ORDER BY iana_timezone, local_date, COALESCE(sent_at, created_at) ASC
ON CONFLICT (iana_timezone, local_date) DO NOTHING;

ALTER TABLE public.outreach_window_claims ENABLE ROW LEVEL SECURITY;

-- Service role only (it bypasses RLS); no policies are granted to
-- anon/authenticated, so PostgREST clients cannot read or write claims.
REVOKE ALL ON public.outreach_window_claims FROM PUBLIC, anon, authenticated;
GRANT INSERT, DELETE, SELECT ON public.outreach_window_claims TO service_role;
