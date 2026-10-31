# Monorepo Cutover & Rollback Runbook

**Repository:** `sahinpro/Portfolio-by-sahinpro`
**Target:** Bun-workspace monorepo → three Vercel projects (`apps/website`, `apps/workspace`, `apps/admin`)
**Author:** Qoder migration agent

> This runbook separates **code migration** (done in the repo) from **production actions**
> (dashboard access, DNS, Vault, Supabase) that a **human owner must perform and verify**.
> The agent is explicitly **NOT authorized** to deploy, reassign domains, change DNS/Cloudflare,
> run Supabase SQL, edit Vault, or delete data. Those steps are documented here, never executed.
>
> **Never print secret values.** Throughout, "check" means observe status/HTTP codes or row counts,
> not echo tokens/keys.

---

## Prerequisite — owner decisions (now RESOLVED) & pre-Phase-2 gate

The two audit blockers have been decided by the owner. **Design lives in
`MONOREPO_MIGRATION_AUDIT.md` §10–§13; this runbook turns it into ordered manual steps.**

- **B1 → Option B (DB-backed authz authoritative).** `public.admin_emails` / `is_admin()` is the
  source of truth; app gate becomes fail-closed. **This requires the staged rollout in
  Appendix B — the `testimonials` RLS mismatch and the unverified `projects`/`site_settings`/
  `resume`/`page_views`/storage policies MUST be reconciled before the fail-closed flip, or an
  admin could be locked out.** Owner-executed production SQL only; never run by the agent.
- **B2 → Option A (server-side revalidation).** The Website owns `/api/revalidate`; Admin/Workspace
  revalidate server-to-server via a validated `WEBSITE_URL` + server-only `REVALIDATE_SECRET`.
  See the integration smoke check in §5 and the secret placement in audit §12.
- **Phase 2 (physical moves) remains PAUSED.** Nothing below happens until the owner approves the
  corrected design docs and the source restructure lands and builds green.

---

## 1. Pre-cutover (read-only verification — owner)

1. **Code review + local/CI green.** Confirm `bun install --frozen-lockfile`, per-app
   `type-check`, `lint`, `build`, and `bun run test:outreach` all pass on the final migration
   commit. Record the commit SHA.
2. **Capture current production state** from the Vercel & Supabase dashboards (read-only):
   - Existing Vercel project ID(s), framework preset, Root Directory, and **build-command /
     output-dir** settings.
   - Current domain attachments: which project owns `www.sahinpro.me`, `sahinpro.me`,
     legacy `sahin.pro.bd` / `www.sahin.pro.bd`.
   - Cloudflare DNS records for `sahinpro.me` and any `www`/`admin`/`workspace` subdomains, and
     whether they are **proxied (orange-cloud)** or DNS-only. Verify current state — do not rely on
     old screenshots.
   - Confirm the last known-good production deployment is live and recoverable.
3. **Supabase read-only checks (SELECT-only / dashboard; never mutate):** run the queries in
   **Appendix A** and record results (counts / booleans / policy names only — no secret values):
   - `public.admin_emails`: confirm the intended admin identity is present (compare normalized
     lowercase email only). Required before any fail-closed authz flip (Appendix B).
   - `leads` RLS present/unchanged (`leads_admin_select/insert/update/delete`) — repo-VERIFIED.
   - **Live-inspect the policies NOT present in the repo:** `projects`, `site_settings`, `resume`,
     `page_views`, and storage bucket read/upload policies (Appendix A). Do not assume they use
     `is_admin()`; record the actual `permissive`/`roles`/`using`/`check` clauses.
   - Exactly **one** pg_cron job `outreach-window-reminder-tick`, expected schedule `*/3 * * * *`
     (after `20261028130000_reduce_outreach_cron_frequency.sql`). Do **not** change it here.
   - `outreach_window_notifications` unique index `(iana_timezone, local_date, window_start)`
     present (dedupe guarantee).
   - Vault secrets `outreach_cron_endpoint_url` and `outreach_cron_secret` exist (names only).
4. **Export browser-local leads (owner action on the CURRENT CRM origin `www.sahinpro.me`).**
   On `https://www.sahinpro.me/admin/leads`, run the CRM's JSON export and record the export
   count and file hash. Keep the export **outside the repository** (never commit it). This covers
   the IndexedDB origin-scoping risk (audit §5.1): leads stored under `www.sahinpro.me` will not
   automatically exist on `workspace.sahinpro.me`.

**Gate:** do not proceed until every "verify" above is captured and the pre-cutover production
deployment is confirmed healthy.

---

## 2. Deploy each app to PREVIEW first (owner, no production domains yet)

1. Create/confirm **three separate Vercel projects**, all linked to this same repository:
   - Website — Root Directory `apps/website`
   - Workspace — Root Directory `apps/workspace`
   - Admin — Root Directory `apps/admin`
2. For each project verify Vercel **monorepo root-dir detection**: the root `bun.lock` and
   `packages/shared` must be visible to every build. Check the project setting
   **"Include source files outside of the Root Directory in the Build Step"** is enabled as
   required by current Vercel monorepo guidance — do not assume, confirm in the dashboard.
   Set each project's install/build commands to the workspace-aware commands
   (e.g. `bun install --frozen-lockfile` at repo root, then per-app build).
3. Assign per-app environment variables in Vercel (see audit §6 map). **Least privilege:**
   - `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `OUTREACH_NOTIFICATION_ZONES` → **Workspace only.**
   - `RESEND_API_KEY` → Website (contact) **and** Workspace (outreach).
   - `TURNSTILE_SECRET_KEY`, `REVALIDATE_SECRET`, `ANALYTICS_INGEST_SECRET`, Upstash Redis
     vars → **Website only.**
   - `NEXT_PUBLIC_*` Supabase keys + admin display vars → the apps that render those screens.
   - Never prefix a true secret with `NEXT_PUBLIC_`. Never put service-role/Resend/cron secrets in
     a client bundle.
4. Deploy preview URLs and smoke-test each app in isolation: routes render, auth gates hold, APIs
   respond, cross-origin calls resolve to the intended host, static assets load. **Do not send real
   outreach emails** — use `mode: "preview"` on the notification-test endpoint or the no-send path.

---

## 3. Domain cutover sequence (owner, Vercel UI — reversible)

Perform in this order to avoid a broken production window. Only the owner executes; the agent
documents.

1. **Attach `www.sahinpro.me` and `sahinpro.me` to the Website project** (keep pointing at the
   working website deployment). `sahinpro.me` → `www.sahinpro.me` permanent redirect is preserved
   by the website middleware/`vercel.json`. Verify TLS and canonical redirect.
2. **Attach `workspace.sahinpro.me` to the Workspace project.** Verify the CRM entrypoint loads,
   auth works, lead CRUD is gated, outreach APIs respond.
3. **Attach `admin.sahinpro.me` to the Admin project.** Verify `/admin/...` CMS paths (kept during
   phase one) work and the root leads to the dashboard.
4. **Legacy redirects:** keep `sahin.pro.bd` / `www.sahin.pro.bd` → canonical website (owned by the
   Website project's `vercel.json`). Confirm the legacy-host `has: host` redirects still fire.
5. **Old CRM/CMS paths on the public host** — add explicit, tested redirects so bookmarks survive:
   - `www.sahinpro.me/admin/leads*` → `https://workspace.sahinpro.me/…` (CRM routes to Workspace).
   - `www.sahinpro.me/admin/*` (CMS) → `https://admin.sahinpro.me/admin/*` (to Admin).
   - **Do NOT blanket-redirect all `/admin/*` to one app** — distinguish CRM vs CMS first
     (audit §8). Preserve query strings (auth `from`, ids, filters). Prevent redirect loops: the
     destination host must not re-match the source rule.
6. **Cloudflare / DNS:** do NOT change proxy or records unless the owner, after reviewing the
   current target vs Vercel's requested record, decides to. Existing records were reported proxied;
   verify current state before touching. The intended split uses **separate Vercel projects with
   their own custom domains**, not Cloudflare path routing on a single origin.
7. Keep the **previous public-site deployment recoverable** throughout the validation window
   (do not delete the old project/deployment yet).

**Verify after each attach:** TLS valid, correct app served, authorization enforced, deep links +
login `from`/callback URLs resolve within the same app (no open redirects), `noindex` present on
Admin & Workspace.

---

## 4. Supabase Vault cron cutover (owner, manual, reversible)

**Do this ONLY after `workspace.sahinpro.me` is live, its `/api/cron/outreach-windows` smoke-tested,
and dedupe confirmed.** Exactly one authoritative target at all times; **no second cron job.**

- **Vault secret name to update:** `outreach_cron_endpoint_url`
- **Existing value:** `https://www.sahinpro.me/api/cron/outreach-windows`
- **Intended new value:** `https://workspace.sahinpro.me/api/cron/outreach-windows`
- The bearer value lives separately in `outreach_cron_secret` — **never printed, never rotated**
  as part of this move.

Manual steps (owner, via approved Supabase process — SQL Editor or Vault UI):

1. Confirm the current endpoint URL value on `www.sahinpro.me` still returns 200/207 (healthy)
   before changing anything.
2. **Back up the current Vault secret id** for `outreach_cron_endpoint_url`:
   `select id from vault.secrets where name = 'outreach_cron_endpoint_url';` (record the id, not
   the decrypted value).
3. Update only the URL, preserving the name and note (run in the owner's SQL session — the agent
   does not execute this):
   ```sql
   select vault.update_secret(
     (select id from vault.secrets where name = 'outreach_cron_endpoint_url'),
     'https://workspace.sahinpro.me/api/cron/outreach-windows',
     'outreach_cron_endpoint_url',
     'GET endpoint invoked by pg_cron every 3 minutes (workspace)');
   ```
4. **Verify without leaking secrets:**
   - Wait for the next `*/3 * * * *` tick. Check `net._http_response` (or `extensions` schema) for
     the request status to the **new** host — expect `200`/`207`, not `401`/`503`/connection error.
   - Confirm `pg_cron.job` still lists exactly one `outreach-window-reminder-tick`
     (`select jobid, jobname, schedule from <cron_schema>.job;`). Do not create a new job.
   - Confirm no duplicate sends: `outreach_window_notifications` unique index prevents them; check
     counts are stable.
5. If the new host fails, execute §6 rollback immediately.

---

## 5. Post-cutover acceptance (owner verifies, records — no secrets)

- [ ] Public website visually identical; canonical SEO, sitemap/robots/llms, favicons/fonts intact.
- [ ] `sahinpro.me`→`www`, and legacy `.pro.bd` 301s still work.
- [ ] Workspace reachable at its host; renders the **CRM**, not the portfolio.
- [ ] Admin reachable at its host; all CMS features (projects, testimonials, media, analytics,
      settings, resume) work.
- [ ] **Lead data verified:** on Workspace, run cloud-migration verification. Record counts:
      local (from §1.4 export), uploaded, verified, missing, mismatched. Discrepancies must be
      reported and the **local copy never auto-deleted**. Browser-local backups stay until the
      owner confirms cloud verification.
- [ ] **Authorization (Option B):** authenticated but non-allowlisted user and unauthenticated
      user cannot read/mutate leads OR CMS data via UI **or** direct Supabase REST; RLS denies;
      privileged API routes return 401/403; a **missing/failed authz lookup fails CLOSED**
      (never grants). Confirm the shadow divergence counter (Appendix B step 2) reports zero
      env-only mismatches before the DB-only flip.
- [ ] **Cache revalidation (Option A, audit §11):** an Admin/Workspace content mutation calls its
      own-app authenticated action endpoint, which calls the Website `/api/revalidate` via the
      absolute `WEBSITE_URL` with `x-revalidate-token`. Verify: correct tags flushed on the Website,
      a **relative** call does NOT hit the admin/workspace origin, and a timeout/non-2xx returns a
      retryable `revalidationFailed` flag without rolling back the saved content. `REVALIDATE_SECRET`
      and `WEBSITE_URL` are server-only (not `NEXT_PUBLIC_`, not in any browser bundle).
- [ ] Contact form, page-view ingestion, resume download/storage all pass smoke checks.
- [ ] Outreach cron: **one** authoritative endpoint, no duplicate notifications.
- [ ] Record final commit SHAs per app, Vercel project↔domain mapping, verification timestamp, and
      any unresolved issues. **No secret values in this record.**

---

## 6. Rollback (manual, reversible, non-destructive)

Never use `git reset --hard` / `git clean -fd`. Prefer reverting the migration commit or
redeploying the last known-good commit after reviewing the diff.

**Domain/deployment rollback**

1. Re-attach `www.sahinpro.me` / `sahinpro.me` to the previous known-good Website deployment
   (kept recoverable in §3.7).
2. Detach `workspace.sahinpro.me` / `admin.sahinpro.me` from the new projects if they are unstable.
3. Remove the added legacy redirects on the public host if they cause loops.
4. Do NOT delete the new deployments or the browser-local lead export backups until stability is
   re-established.

**Cron (Vault) rollback — only if §4 cutover already happened**

1. Restore the previous URL using the id saved in §4.2:
   ```sql
   select vault.update_secret(
     (select id from vault.secrets where name = 'outreach_cron_endpoint_url'),
     'https://www.sahinpro.me/api/cron/outreach-windows',
     'outreach_cron_endpoint_url',
     'GET endpoint invoked by pg_cron every 3 minutes');
   ```
2. Verify the `www.sahinpro.me` cron endpoint responds 200/207 on the next tick; confirm still one
   job; confirm no duplicate notifications were produced by the brief overlap.
3. Do NOT modify `outreach_cron_secret`. Do NOT unschedule/reschedule the job.

**Data**

- Supabase schema, `leads` rows, `admin_emails`, RLS policies and `outreach_window_notifications`
  are **untouched by this migration** — no data rollback needed.
- Browser-local leads were exported (§1.4) and never deleted; re-import on the intended origin if
  needed. Preserve the export + any audit logs and note the reason for rollback.

**Authorization (if the fail-closed flip in Appendix B caused a lockout)**

1. Immediately redeploy the prior **shadow-phase** build (DB authoritative, env observation only) —
   do NOT edit live RLS to "fix" access and do NOT let env grant access again.
2. Reconcile `public.admin_emails` (owner, additive `INSERT ... ON CONFLICT DO NOTHING` only) so the
   identity resolves via the DB.
3. Only then retry the DB-only flip. If `testimonials`/`projects` RLS was tightened and caused
   breakage, revert that single owner-executed SQL migration via its documented down-step.

---

## Appendix A — read-only verification queries (owner, SELECT-only; never mutate)

Run in the Supabase SQL Editor (or a read-only session). **Record only** counts / booleans / policy
names / grant rows — never secret values, never `decrypted_secret`. These establish the **live**
state; the repo-verified facts are already fixed in audit §10.1/§10.5. Any difference between the
repo migration and these results is itself a finding to resolve before Phase 2.

```sql
-- A.0 Which of these tables actually exist right now (some are not in repo migrations)?
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('leads','projects','testimonials','site_settings','resume','page_views','admin_emails');

-- A.1 Is the intended admin identity present? (compare normalized lowercase; no secret exposure)
select lower(email) = lower('you@example.com') as intended_admin_present
from public.admin_emails
where lower(email) = lower('you@example.com');
select count(*) as admin_email_count from public.admin_emails;   -- fail-closed if 0

-- A.2 ALL row-level-security policies for the relevant public tables (do NOT assume is_admin()).
--     Capture name, table, command, roles, permissive, USING, WITH CHECK for each.
select c.relname as table_name, p.polname, p.polcmd,
       (select array_agg(r.rolname) from pg_roles r where r.oid = any(p.polroles)) as roles,
       p.polpermissive,
       pg_get_expr(p.polqual, p.polrelid)      as using_expr,
       pg_get_expr(p.polwithcheck, p.polrelid) as check_expr
from pg_policy p
join pg_class c on c.oid = p.polrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('leads','projects','testimonials','site_settings','resume','page_views')
order by c.relname, p.polname;

-- A.3 RLS enabled? (relrowsecurity must be true; also note forced).
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('leads','projects','testimonials','site_settings','resume','page_views');

-- A.4 Table PRIVILEGES for the two browser roles on each resource (which roles can even attempt writes).
select table_name, grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('leads','projects','testimonials','site_settings','resume','page_views')
  and grantee in ('anon','authenticated','service_role')
order by table_name, grantee, privilege_type;

-- A.5 Can is_admin() be executed by the roles the guard/browser rely on? (expect authenticated + anon).
select pg_catalog.pg_get_userbyid(p.proowner) as owner,
       has_function_privilege('authenticated', 'public.is_admin()', 'execute') as authed_execute,
       has_function_privilege('anon',         'public.is_admin()', 'execute') as anon_execute
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_admin';

-- A.6 Public-READ intent: for published content confirm the public (anon) SELECT policy is by design
--     (expect a status/visibility predicate, NOT `true` across the board). Review A.2 SELECT rows.

-- A.7 Storage buckets + storage.objects policies (media & resume uploads).
select bucketid, name, public as bucket_is_public from storage.buckets order by name;
select policy_name, command, permissive,
       (select array_agg(r.rolname) from pg_roles r where r.oid = any(roles)) as roles,
       pg_get_expr(qual, 'storage.objects'::regclass)   as using_expr
from storage.policies order by bucketid, policy_name;
-- roles for anon/authenticated on storage.objects:
select grantee, privilege_type
from information_schema.role_usage_grants
where object_schema = 'storage' and object_name = 'objects'
  and grantee in ('anon','authenticated');

-- A.8 Cron job count / schedule (names + schedule only; never read decrypted_secret).
-- resolve the pg_cron schema first, then:
-- select jobid, jobname, schedule from <cron_schema>.job
--   where jobname = 'outreach-window-reminder-tick';
```

**Interpreting results (separate repo-verified vs live):**

- `leads` — repo VERIFIED to `is_admin()`; A.2/A.3 should agree. Any divergence = finding.
- `testimonials` — repo VERIFIED writes are `authenticated` with `USING/WITH CHECK = true`
  (audit §10.5). If A.2/A.4 still show broad authenticated write grants + `SELECT`-capable roles,
  that confirms the **pre-existing** over-broad policy. It is **not** silently changed during the
  moves; tightening happens only in Appendix B step 5 (owner RLS SQL).
- `projects`/`site_settings`/`resume`/`page_views`/storage — **NOT in repo migrations**; A.0–A.7 are
  the only way to know their true policy. Record each: is it restricted to the admin identity, and
  is public read (published) intentional? Feed results into audit §13 and re-review before Phase 2.

---

## Appendix B — DB-authoritative rollout with shadow verification (no permanent DB-OR-env)

**No step is executed by the agent.** Steps 1–4 are code (reversible via git revert/redeploy);
step 5 is owner-executed production SQL, gated on step 1. The database is authoritative throughout;
the env gate never grants once the DB-only gate is enabled — the env result is only **observed**
(shadow), never used to allow access.

1. **Verify first (Appendix A.1 + A.5):** the intended admin email is in `public.admin_emails`, and
   `authenticated`/`anon` can execute `is_admin()`. If the admin is absent, ADD it (additive,
   idempotent) BEFORE any enforcement change:
   ```sql
   insert into public.admin_emails (email) values ('you@example.com')
   on conflict (email) do nothing;
   ```
2. **Shadow phase (code, DB authoritative):** `requireDbAdmin` decides with
   `userClient.rpc('is_admin')` in the caller's JWT context (no service-role, audit §10.2). In
   parallel it computes the legacy env result and logs a **divergence counter only** (DB-allow vs
   env-allow mismatch counts, never emails/secrets). Deploy behind preview first.
3. **Reconcile until zero divergence** across real admin sessions (every admin resolves via the DB).
4. **Enable DB-only fail-closed (code):** delete the env branch entirely. `is_admin()` becomes the
   sole browser + server authority; UI keeps the 4-state machine and treats lookup errors as
   retryable-deny, never "authorized". Fail-closed on missing config, RPC error, or `false`.
5. **RLS alignment (owner production SQL — only after 1–4 and Appendix A inspection):**
   - Draft a **patch-before-push** migration tightening `testimonials` CUD to `is_admin()` and
     confirming/aligning `projects`. Do not run it until step 1 proves current editors are all in
     `admin_emails` (prevents lockout). Keep RLS as an independent layer.
6. **Tests** (audit §10.4) pass before flipping step 4 and before running step 5.

---

## 7. Reference docs (validate current guidance before production actions)

- Bun workspaces: https://bun.com/docs/pm/workspaces · lockfile: https://bun.com/docs/pm/lockfile
- Vercel monorepos: https://vercel.com/docs/monorepos ·
  FAQ (shared source outside root dir): https://vercel.com/docs/monorepos/monorepo-faq ·
  build/root config: https://vercel.com/docs/builds/configure-a-build
- Next.js `transpilePackages`: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
