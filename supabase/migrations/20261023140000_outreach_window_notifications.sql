-- Scheduled outreach-window email delivery log (server / service role only).
-- Prevents duplicate reminders for the same IANA zone + local calendar date.

CREATE TABLE IF NOT EXISTS public.outreach_window_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iana_timezone text NOT NULL,
  local_date date NOT NULL,
  window_start text NOT NULL DEFAULT '09:30',
  market_id text NOT NULL DEFAULT '',
  zone_city text NOT NULL DEFAULT '',
  status text NOT NULL CHECK (status IN ('sent', 'failed')),
  resend_id text,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  CONSTRAINT outreach_window_notifications_unique
    UNIQUE (iana_timezone, local_date, window_start)
);

CREATE INDEX IF NOT EXISTS outreach_window_notifications_local_date_idx
  ON public.outreach_window_notifications (local_date DESC);

ALTER TABLE public.outreach_window_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.outreach_window_notifications FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.outreach_window_notifications TO service_role;
