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

### Deploy `submit-contact` (contact form inbox)

```bash
npm run deploy:function:submit-contact
```

Set any required secrets (e.g. `TURNSTILE_SECRET_KEY`) in the dashboard or via `npx supabase secrets set`.

## Database

Apply SQL migrations from `supabase/migrations/` with the SQL Editor or `supabase db push` when your project is linked.
