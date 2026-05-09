# Supabase (this repo)

## Edge Functions

If the browser shows **404** on `record-page-view` (or **CORS error** on that request), the function is **not deployed** to your project yet. Local code in `supabase/functions/` does not run until you deploy.

### Deploy `record-page-view` (analytics)

This repo includes the CLI as a dev dependency. Use **`npx supabase`** (or the npm scripts below) so you do not need a global install.

1. Log in (once): `npx supabase login`
2. Link this folder to your project (once): `npx supabase link --project-ref YOUR_PROJECT_REF`  
   (`YOUR_PROJECT_REF` is the subdomain of `https://YOUR_PROJECT_REF.supabase.co`)
3. Set the secret (same value as `VITE_ANALYTICS_INGEST_SECRET` in `.env` / Vercel):  
   `npx supabase secrets set ANALYTICS_INGEST_SECRET=your_long_random_string`
4. Deploy:  
   `npm run deploy:function:record-page-view`  
   or: `npx supabase functions deploy record-page-view`

Or use the **Supabase Dashboard → Edge Functions**: create/deploy `record-page-view` from this repo’s `supabase/functions/record-page-view/index.ts` and add secret **ANALYTICS_INGEST_SECRET** under Edge Function secrets.

### Deploy `submit-contact` (contact form inbox + optional Resend email)

The function inserts into `contact_submissions` using the **service role** key.

On **Supabase-hosted** Edge Functions, **`SUPABASE_SERVICE_ROLE_KEY` is injected for you** — you do **not** set it with the CLI. The CLI **refuses** names starting with `SUPABASE_` (`Env name cannot start with SUPABASE_, skipping`) because those are reserved for the platform.

1. Log in and link the project (same as above) if you have not already.
2. Optional: if you use Turnstile on the contact form, set:  
   `npx supabase secrets set TURNSTILE_SECRET_KEY=...`
3. Optional: if you want email notifications via Resend, set:  
   `npx supabase secrets set RESEND_API_KEY=re_xxxxxxxxx CONTACT_NOTIFICATION_TO_EMAIL=you@example.com CONTACT_NOTIFICATION_FROM_EMAIL="Portfolio Contact <onboarding@resend.dev>"`  
   Replace `re_xxxxxxxxx` with your real Resend API key.
4. Only if the function still has no service role (e.g. some local/self-hosted setups): set a **non-reserved** name with the same value as **Project Settings → API → `service_role`**:  
   `npx supabase secrets set SERVICE_ROLE_KEY=paste_service_role_jwt_here`  
   The function reads `SUPABASE_SERVICE_ROLE_KEY` first, then `SERVICE_ROLE_KEY`.
5. Deploy:  
   `npm run deploy:function:submit-contact`  
   or: `npx supabase functions deploy submit-contact`

Notes:

- `RESEND_API_KEY` and `CONTACT_NOTIFICATION_TO_EMAIL` are required only for email notifications.
- Replace `re_xxxxxxxxx` anywhere you use it with your actual Resend API key.
- `CONTACT_NOTIFICATION_FROM_EMAIL` is optional. The default is `Portfolio Contact <onboarding@resend.dev>`. For production, use a verified domain/sender in Resend.
- The function always stores the submission in `contact_submissions` first. If Resend fails, the inbox entry is still saved.

If submissions still fail, open **Edge Functions → submit-contact → Logs** and confirm the `contact_submissions` table exists (the service role bypasses RLS for inserts when the key is valid).

## Database

Apply SQL migrations from `supabase/migrations/` with the SQL Editor or `supabase db push` when your project is linked.

The `20260509000000_projects_refactor.sql` migration documents optional `CHECK` constraint updates and backfills categories/framework slugs after the admin project form refactor. Uncomment and adjust statements to match your actual `projects` table definitions before running.

If the SQL editor reports **Success. No rows returned**, that is normal for `UPDATE` (no tabular output). **0 rows changed** means no rows matched — e.g. the table is empty or categories/frameworks were already updated. Use the commented `SELECT` snippets at the top of that file to inspect `category` / `custom_framework` values.
