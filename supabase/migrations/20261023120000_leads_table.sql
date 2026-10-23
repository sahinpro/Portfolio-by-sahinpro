-- Lead CRM: move leads from browser-local IndexedDB into PostgreSQL.
--
-- HOW TO APPLY: Supabase Dashboard → SQL Editor → paste → Run (or `supabase db push`).
-- Run it BEFORE using the Leads page. The app keeps working read-only against
-- IndexedDB until this exists, and the Leads page shows an "Upload local leads"
-- banner so nothing is lost.
--
-- Additive only: this creates new objects (admin_emails, is_admin(), leads) and
-- never alters or deletes any existing table, policy or row.
--
-- SECURITY MODEL (mirrors how the app already authorises admins):
--   * The app gates /admin with src/admin/lib/authHelpers.ts (NEXT_PUBLIC_ADMIN_EMAIL).
--   * PostgREST cannot read env vars, so the same allowlist lives in the database:
--     public.admin_emails. public.is_admin() compares the email claim of the
--     request's JWT against that table, and every leads policy requires it.
--   * No anon access to leads at all, and the service-role key is never used
--     client-side — the browser keeps using the existing public/anon key plus
--     a user session, exactly like projects, testimonials and resume.

-- ---------------------------------------------------------------------------
-- 1. Admin allowlist (RLS source of truth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Case-insensitive lookups happen through lower(email) inside public.is_admin().
CREATE INDEX IF NOT EXISTS admin_emails_email_idx ON public.admin_emails (lower(email));

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- No policies on purpose: even the list of admin emails stays private. Only the
-- SECURITY DEFINER helper below may read this table.
REVOKE ALL ON public.admin_emails FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.admin_emails TO service_role;

-- ---------------------------------------------------------------------------
-- 2. Authorization helpers
-- ---------------------------------------------------------------------------
-- PostgREST puts the verified JWT claims into the transaction-local
-- `request.jwt.claims` setting; Supabase's own auth.jwt() reads the same value.
-- Reading it directly keeps this migration working on any Supabase version
-- (older images have no auth.jwt()) and never trusts a client-supplied header.
CREATE OR REPLACE FUNCTION public.jwt_email()
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  raw text := nullif(current_setting('request.jwt.claims', true), '');
  claim_email text := nullif(current_setting('request.jwt.claim.email', true), '');
BEGIN
  IF claim_email IS NOT NULL THEN
    RETURN lower(claim_email);
  END IF;
  IF raw IS NULL THEN
    RETURN '';
  END IF;
  RETURN lower(coalesce(raw::jsonb ->> 'email', ''));
EXCEPTION WHEN others THEN
  -- Malformed / non-JSON claims are treated as "not signed in".
  RETURN '';
END;
$$;

ALTER FUNCTION public.jwt_email() OWNER TO postgres;
-- Not callable over the API by any client role: only public.is_admin() uses it,
-- and it runs there as this function's owner. Verified against PostgREST.
REVOKE ALL ON FUNCTION public.jwt_email() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails a
    WHERE lower(a.email) = public.jwt_email()
  );
$$;

ALTER FUNCTION public.is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
-- Lets the admin UI tell "not authorised" apart from "no leads yet".
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ---------------------------------------------------------------------------
-- 3. The leads table
-- ---------------------------------------------------------------------------
-- Column set = the full Lead record (src/admin/types/lead.ts), including the
-- legacy fields the simplified form no longer edits, so nothing is dropped when
-- existing browser records are uploaded.
--
-- `id` is text (not uuid) on purpose: records created before this migration may
-- carry non-uuid ids (`lead-lxj3...`), and their ids must survive the move.
-- New rows still get a uuid from the default or from the app.
CREATE TABLE IF NOT EXISTS public.leads (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,

  -- Business information
  business_name text NOT NULL,
  niche text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  website_url text NOT NULL DEFAULT '',
  website_status text NOT NULL DEFAULT 'unknown',
  lead_source text NOT NULL DEFAULT '',

  -- Contact information
  contact_person text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  instagram_url text NOT NULL DEFAULT '',
  facebook_url text NOT NULL DEFAULT '',
  preferred_contact_method text NOT NULL DEFAULT '',

  -- Outreach tracking
  outreach_status text NOT NULL DEFAULT 'not_contacted',
  first_contact_date date,
  last_contact_date date,
  follow_up_date date,
  follow_up_count integer NOT NULL DEFAULT 0,
  first_message text NOT NULL DEFAULT '',
  last_conversation text NOT NULL DEFAULT '',

  -- Qualification (legacy, preserved)
  priority text NOT NULL DEFAULT 'medium',
  opportunity text NOT NULL DEFAULT '',
  improvements text NOT NULL DEFAULT '',
  est_budget text NOT NULL DEFAULT '',
  expected_value text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  project_status text NOT NULL DEFAULT 'not_qualified',

  -- Local duplicate-detection fingerprint
  normalized_key text NOT NULL DEFAULT '',

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- No updated_at trigger: the app writes updated_at itself so imported records
-- keep their original timestamps.

CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON public.leads (updated_at DESC);
CREATE INDEX IF NOT EXISTS leads_business_name_idx ON public.leads (lower(business_name));
CREATE INDEX IF NOT EXISTS leads_outreach_status_idx ON public.leads (outreach_status);
CREATE INDEX IF NOT EXISTS leads_follow_up_date_idx ON public.leads (follow_up_date)
  WHERE follow_up_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS leads_normalized_key_idx ON public.leads (normalized_key)
  WHERE normalized_key <> '';

-- ---------------------------------------------------------------------------
-- 4. Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.leads FROM PUBLIC, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;

DROP POLICY IF EXISTS leads_admin_select ON public.leads;
CREATE POLICY leads_admin_select
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS leads_admin_insert ON public.leads;
CREATE POLICY leads_admin_insert
  ON public.leads
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS leads_admin_update ON public.leads;
CREATE POLICY leads_admin_update
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS leads_admin_delete ON public.leads;
CREATE POLICY leads_admin_delete
  ON public.leads
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. REQUIRED manual step — authorise yourself
-- ---------------------------------------------------------------------------
-- Until at least one email is listed, the Leads page is empty for everyone
-- (fail-closed). Add the account you sign into /admin with:
--
--   INSERT INTO public.admin_emails (email)
--   VALUES ('you@example.com')
--   ON CONFLICT (email) DO NOTHING;
--
-- Keep it in sync with NEXT_PUBLIC_ADMIN_EMAIL in your deployment env.
