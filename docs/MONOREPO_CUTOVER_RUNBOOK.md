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

## Why the ordering matters (FC-003)

The production `pg_cron` job currently calls:

`https://www.sahinpro.me/api/cron/outreach-windows`

In the new architecture that handler lives under **Workspace**
(`apps/workspace/src/server/api/routes/outreachCron.ts`) and is **no longer mounted by the
Website API** (`apps/website/src/server/api/app.ts`). The `supabase/` directory is byte-identical
between `main` and this branch (`git diff origin/main...HEAD -- supabase/` is empty), so **moving
the code does not by itself create a second cron job or repoint the schedule** — the schedule and
its URL live in Supabase, not in the repo.

The danger is purely a **sequencing** one: the moment the new Website deployment becomes live on
`www.sahinpro.me`, that host stops serving `/api/cron/outreach-windows`. If the Vault URL still
points there, the next scheduled tick gets a 404. Therefore the **cron transition (Stage B) MUST
complete and be verified before the Website production deployment (Stage C)** removes the old
route. The stages below enforce exactly that ordering. No compatibility proxy is required if the
owner follows this sequence (see "Decision: no code proxy needed" at the end of Stage B).

---

## Outreach notification model — Daily Outreach Digest (current behaviour)

The `GET /api/cron/outreach-windows` endpoint no longer sends one email per city/timezone that
happens to open on a tick. It now produces **at most one** **Daily Outreach Digest** per Bangladesh
calendar day:

- **Schedule intent:** one daily execution at **08:00 Bangladesh time** (`Asia/Dhaka`, fixed +06,
  no DST). Supabase pg_cron defaults to UTC, so the proposed expression is **`0 2 * * *`**
  (02:00 UTC = 08:00 BD). **The agent does NOT change the schedule** — the exact production
  reschedule, the `show cron.timezone;` verification step, and rollback are documented in
  **`docs/OUTREACH_DAILY_DIGEST_SCHEDULER_PROPOSAL.sql`** for owner review only.
- **Coverage:** each digest lists every enabled outreach target whose window opens within
  `[execution instant, execution instant + 24h)`, computed from the existing `outreach_schedule_config`
  - planner-zone settings (no cities/timezones are hardcoded). Expired and beyond-24h windows are
    excluded; entries are DST-aware and sorted chronologically by Bangladesh time (next opportunity
    first), grouped by Today/Tomorrow.
- **Template:** a single premium mini-dashboard email (hero card, summary metrics, a layered schedule
  table with mobile stacking, a next-opportunity highlight with countdown, one **Open Leads** CTA,
  minimal footer). It replaces the old per-window template entirely.
- **Idempotency & safety:** delivery is guarded by an **atomic, database-backed daily claim** reusing
  the existing `outreach_window_claims` table with a synthetic key (`iana_timezone =
'digest/asia-dhaka'`, `local_date = <BD date>`). **No schema change/migration is required.**
  Concurrent/repeated ticks cannot double-send; a provider failure releases the claim and is recorded
  as `failed`, never as a success. A separate `mode:"preview"` path renders the digest without
  claiming or sending. **No message is ever sent to a prospect** — this notifies the owner only.
- **Disk I/O:** reducing the tick cadence from `*/3` (≈480/day) to daily removes idle
  `cron.job_run_details` + pg_net write churn. This is **not** claimed to clear the Supabase free-tier
  Disk I/O warning by itself; the owner verifies the Disk I/O Budget after applying the scheduler
  proposal.

The Stage A/B cron-continuity checks below still apply (route reachability, single job, Vault URL
repoint) — only the _effect_ of a scheduled tick changed: a tick now sends one digest (or skips), not
per-city emails.

---

## Prerequisite — owner decisions & pre-Phase-2 gate

The two audit blockers have been decided by the owner. **Design lives in
`MONOREPO_MIGRATION_AUDIT.md` §10–§13; this runbook turns it into ordered manual steps.**

- **B1 → authorization is fail-closed at the app gate.** The shared `isAllowedAdminEmail`
  (`packages/shared/src/auth.ts`) now **denies** whenever `NEXT_PUBLIC_ADMIN_EMAIL` is unset/blank
  or does not match the signed-in user's email (FC-001). An admin is locked out until the env is
  configured, so **confirm the allowlist is set for every app before cutover.** The deferred,
  DB-backed `requireDbAdmin` rollout (Appendix B) remains a **separate future change** and is not
  part of this cutover. The `testimonials` RLS mismatch and the unverified
  `projects`/`site_settings`/`resume`/`page_views`/storage policies still require Appendix-A
  inspection before that future DB-authoritative flip — they are **not** touched here.
- **B2 → Option A (server-side revalidation).** The Website owns `/api/revalidate`; Admin/Workspace
  revalidate server-to-server via a validated `WEBSITE_URL` + server-only `REVALIDATE_SECRET`.
  See the Stage E acceptance check and the secret placement in audit §12.
- **Phase 2 (physical moves) remains PAUSED.** Nothing below happens until the owner approves the
  corrected design docs and the source restructure lands and builds green.

---

## Vercel Root Directory vs monorepo root (reference for all stages)

The three Vercel projects use **app-specific** Root Directories. This is separate from the
**monorepo workspace root** (the repo root, which holds `bun.lock` and `packages/shared`) and from
the Next.js `outputFileTracingRoot` build setting (which points at the repo root so shared source
is traced into each app's server bundle). Do **not** conflate them.

| Vercel Project | Root Directory   |
| -------------- | ---------------- |
| Website        | `apps/website`   |
| Admin          | `apps/admin`     |
| Workspace      | `apps/workspace` |

For every project, keep **"Include source files outside of the Root Directory in the Build Step"**
enabled so `packages/shared` and `bun.lock` remain reachable. Confirm this in the dashboard — do
not assume.

---

## Stage 0 — Pre-merge deployment gate (owner, Vercel Website project) — FR-002

**The risk (confirmed Vercel behavior).** Vercel creates a production deployment _each time you
merge to the project's production branch_ (`main`). PR #4 merges `feat/three-app-monorepo` →
`main`, and the existing **Website** project is connected to this repo with `apps/website` as its
Root Directory and `main` as its Production Branch. The new Website code **no longer mounts**
`GET /api/cron/outreach-windows`, but the production Vault URL still points at
`https://www.sahinpro.me/api/cron/outreach-windows`. So a merge alone would auto-deploy the new
Website and **remove the live cron route before Stage B is done** — breaking the schedule.

**Required outcome:** merging PR #4 must NOT let a new Website production deployment replace the
currently-working Website on `www.sahinpro.me` until Stage B (cron repoint to Workspace) is verified.

**Gate the Website project BEFORE the merge (Website only — Admin/Workspace are separate projects
and are unaffected, so Stage A preparation can proceed):**

1. Confirm the active Website production deployment is healthy and `https://www.sahinpro.me/`
   serves the current site.
2. Confirm the current cron target is healthy **via its last scheduled `pg_cron` result**
   (`net._http_response` shows `200`/`207`) — not by a manual authorized call (see FR-001).
3. Confirm `www.sahinpro.me` / `sahinpro.me` still point to this known-good deployment.
4. **Apply the staged-deployment gate (exact Vercel workflow — use this setting name):**
   1. Open the existing **Website** Vercel project.
   2. Navigate to **Settings → Environments → Production → Branch Tracking**.
   3. Turn **OFF** **Auto-assign Custom Production Domains**.
   4. Confirm that the existing `www.sahinpro.me` and `sahinpro.me` domains remain assigned to the
      current healthy production deployment.
   5. Record the **current deployment ID and commit SHA** (the rollback anchor — see Stage E).
5. **How this behaves (important — per Vercel's documented workflow):**
   - Merging PR #4 into `main` **can still trigger a new Production build**.
   - With **Auto-assign Custom Production Domains** OFF, the new deployment remains **Staged**: it is
     not automatically assigned your production domains and **must not automatically replace** the
     current deployment serving `www.sahinpro.me` / `sahinpro.me`.
   - The staged build is promoted **manually in Stage C** (instant promotion; **no rebuild
     required**).
   - This is a per-project setting: **Admin and Workspace are separate Vercel projects** and are
     unaffected, so Stage A preparation on them proceeds normally.
   - ⚠️ **Do not describe this as disabling production builds or Continuous Deployment** — builds
     still run; only the automatic domain assignment is deferred. **Do not use "Pause Project"**
     (Settings → General) or "Pause all production deployments" (Spend Management): a paused project
     serves **`503 DEPLOYMENT_PAUSED` to every visitor** — a deliberate full outage, the opposite of
     "keep the old site live."
6. Verify the toggle was changed **on the Website project only**. **A preview deployment is not a
   production replacement** — previews are expected and harmless; what matters is that the production
   domains stay on the known-good deployment.
7. To deploy the new Website after Stage B, follow the exact **Promote** workflow in Stage C —
   documented at <https://vercel.com/docs/deployments/promoting-a-deployment>.

**Production environment-variable pre-build gate (FF-001) — BEFORE the merge.** Vercel applies
environment-variable changes only to **new** deployments, and Next.js inlines `NEXT_PUBLIC_*` values
**at build time** — a Staged build carries the env that existed the moment the merge triggered it.
So every required Production variable must already be configured on each project before its
production build is created. Verify (names from each app's committed `.env.example`; **check
presence/assignment only — never print or copy values**):

- **Website — required public Supabase config:** `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` (or the legacy
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Without these the public site and CMS reads break.
- **Website — admin allowlist (conditional):** `NEXT_PUBLIC_ADMIN_EMAIL` — fail-closed. Unset/blank
  simply **denies** the two Website admin features (Coming Soon admin bypass in `PublicSiteGate`,
  admin cache-flush via `requireAdminBearer`); the public portfolio keeps working. Set it only if
  those admin paths are used; keep the value consistent with Admin/Workspace.
- **Website — contact/email:** `RESEND_API_KEY` (server-only; required for the contact form),
  `CONTACT_NOTIFICATION_TO_EMAIL` / `CONTACT_NOTIFICATION_FROM_EMAIL`.
- **Website — revalidation:** `REVALIDATE_SECRET` (server-only) must match the value Admin/Workspace
  send as `x-revalidate-token`; `WEBSITE_URL` is required on the **Admin** project (no default —
  unset makes every cache flush fail with `revalidationFailed`).
- **Website — analytics (optional):** `ANALYTICS_INGEST_SECRET` (+ `NEXT_PUBLIC_` variant) — public
  site works without ingestion.
- **Website — Upstash Redis cache (optional):** `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
- **Website — Turnstile (recommended, optional):** `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (public) +
  `TURNSTILE_SECRET_KEY` (server-only). Without them the contact form is unbot-protected but live.
- **Admin — required:** Supabase vars above + `NEXT_PUBLIC_ADMIN_EMAIL` (fail-closed: **admins are
  locked out** until set) + `WEBSITE_URL` + `REVALIDATE_SECRET`.
- **Workspace — required:** Supabase vars + `NEXT_PUBLIC_ADMIN_EMAIL` (fail-closed). Outreach
  server-only vars (`SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `RESEND_API_KEY`,
  `CONTACT_NOTIFICATION_*`, `SITE_URL`, optional `OUTREACH_NOTIFICATION_ZONES`) must be set before
  the Workspace cron/outreach routes are exercised in Stage A.

**If a required Production env var changes AFTER the merge already created the Staged build**
(FF-001 deployment rule):

1. Keep **Auto-assign Custom Production Domains** OFF.
2. Trigger a **new** Production build with the updated environment (push or manual deploy — it also
   stays Staged).
3. Wait for it to become **Ready** and **Staged**.
4. Inspect that deployment's commit SHA and Environment Variables in its Vercel build log.
5. Promote only the **NEW** correct Staged deployment, and only after Stage B succeeds.

**Never promote an older Staged deployment that was built with missing or incorrect environment
variables.** Admin and Workspace follow the same rule: configure their Production env **before**
their production builds, not after.

**Limitation to respect:** the workflow above is Vercel's documented staging/promotion feature, but
dashboard UIs can drift. Before merging, the owner must **confirm the exact
"Auto-assign Custom Production Domains" toggle exists on the Website project**. If it cannot be
found, **do not merge** — leaving the merge-triggered replacement risk unaddressed is not acceptable.

**After merge, before Stage B** (Auto-assign stays OFF; the new production build remains **Staged**,
the domains stay on the known-good deployment): prepare Admin and
Workspace deployments (Stage A), verify their env, attach their domains when ready, confirm the
Workspace cron route via the unauthenticated `401` probe, and keep the old Website deployment
active on `www.sahinpro.me`.

---

## Stage A — Pre-deployment preparation (owner; no production Website traffic moved yet)

The goal of Stage A is to have **Admin and Workspace fully deployed and reachable on their own
domains — including a Workspace cron route that responds (401) to an unauthenticated reachability
probe — while the existing Website deployment on `www.sahinpro.me` continues to serve the current
cron route untouched.**

1. **Code review + local/CI green.** Confirm `bun install --frozen-lockfile`, per-app
   `type-check`, `lint`, `build`, and `bun run verify` (which now runs **all five** outreach
   suites, the CRM conflict-resolution unit tests, and the shared auth tests) all pass on the final
   migration commit. Record the commit SHA.
2. **Capture current production state** from the Vercel & Supabase dashboards (read-only):
   - Existing Vercel project ID(s), framework preset, Root Directory (see table above), and
     build-command / output-dir settings.
   - Current domain attachments: which project owns `www.sahinpro.me`, `sahinpro.me`,
     legacy `sahin.pro.bd` / `www.sahin.pro.bd`.
   - Cloudflare DNS records for `sahinpro.me` and any `www`/`admin`/`workspace` subdomains, and
     whether they are **proxied (orange-cloud)** or DNS-only. Verify current state — do not rely on
     old screenshots.
   - Confirm the last known-good production Website deployment is live and recoverable, and that it
     **still serves `https://www.sahinpro.me/api/cron/outreach-windows`** — verified from the
     **latest naturally scheduled `pg_cron` invocation's response** in `net._http_response`
     (`200`/`207`), NOT by a manual authenticated request (FR-001/FF-002). A manual unauthenticated
     `GET` may be used only as a reachability probe and returns `401`; it proves the route +
     middleware exist, nothing more. This is the endpoint pg_cron is hitting today; it must stay
     reachable until Stage B completes.
3. **Supabase read-only checks (SELECT-only / dashboard; never mutate):** run the queries in
   **Appendix A** and record results (counts / booleans / policy names only — no secret values):
   - `public.admin_emails` / admin identity presence (compare normalized lowercase email only).
   - `leads` RLS present/unchanged (`leads_admin_select/insert/update/delete`) — repo-VERIFIED.
   - **Live-inspect the policies NOT present in the repo:** `projects`, `site_settings`, `resume`,
     `page_views`, and storage bucket read/upload policies (Appendix A). Do not assume they use
     `is_admin()`; record the actual `permissive`/`roles`/`using`/`check` clauses.
   - Exactly **one** pg_cron job `outreach-window-reminder-tick`. Today its schedule is `*/3 * * * *`
     (after `20261028130000_reduce_outreach_cron_frequency.sql`); the digest redesign proposes moving
     it to a single daily `0 2 * * *` (see `docs/OUTREACH_DAILY_DIGEST_SCHEDULER_PROPOSAL.sql`). Do
     **not** change the schedule here — Stage A/B only repoint the URL; the cadence change is a
     separate owner-applied step.
   - `outreach_window_notifications` unique index `(iana_timezone, local_date, window_start)`
     present (dedupe guarantee).
   - Vault secrets `outreach_cron_endpoint_url` and `outreach_cron_secret` exist (names only).
4. **Confirm the admin allowlist (fail-closed — FC-001).** The shared gate denies _everyone_ if
   `NEXT_PUBLIC_ADMIN_EMAIL` is unset/blank in a given project. Verify it is set, trimmed, and
   lowercase for **Admin** and **Workspace** (and Website if it renders admin screens) **before**
   cutover, or the owner will be locked out the moment the new apps go live.
5. **Migrate the CRM data across origins (owner action — the UI workflow below is VERIFIED from
   source, FF-003).** The Workspace CRM is **Supabase-only**: the `leads` table (RLS) is its single
   data source and the Outreach Time Planner persists zone picks/UI preferences to `site_settings`.
   The app no longer initialises, reads or writes browser IndexedDB — the old `lead-crm-db` under
   `www.sahinpro.me` is untouched but permanently unused (origin-scoped, audit §5.1), so it never
   needs clearing. The JSON export/import is the cross-origin migration path. Actual UI facts from
   source: **Export Backup (JSON)** downloads `leads-backup-<date>.json` (envelope `{app, version,
   exportedAt, count, leads}`); **Import Backup** (file input, `.json` only) validates via
   `parseBackup` (rejects foreign apps/versions and ANY invalid record — nothing is imported on
   validation failure), then shows a Review dialog with `added / updated / skipped(existing record
   preserved — newer, equal, or uncomparable)` counts and two actions: **Merge safely** — writes
   ONLY new/strictly-newer records, compared as parsed epoch timestamps (FF-003 fix: preview and
   write now match; FF-004 fix: epoch-safe comparison — nothing newer, equal, or uncomparable in
   the CRM is ever overwritten) — and **Replace all** — DELETES every visible lead first, never use
   it to merge. Import writes to Supabase directly; there is no browser-local layer to migrate
   through, and nothing is ever auto-deleted.

   **From the old CRM (wherever the JSON backup was exported):**
   1. Keep the exported JSON **outside the repository** — never commit it; record its `count`.
   2. Do NOT bother clearing the legacy IndexedDB copy — the Workspace app never reads it. Never
      choose "Clear site data" just to get rid of it; it is unnecessary and wipes other origin data.

   **On the Workspace origin (`https://workspace.sahinpro.me`):**
   1. Sign in with the configured admin identity; open the Leads page and confirm the cloud table
      loads (empty on a fresh DB is fine).
   2. Click **Import Backup**, select the exported file, and check the Review dialog counts against
      the recorded export count.
   3. Click **Merge safely**. Never choose **Replace all** when preserving existing records matters.
   4. Verify the leads list count matches expectations (refresh / reopen in another browser to
      confirm it is genuinely cloud-backed) and keep the JSON backup until cloud verification is
      complete.

6. **Create/confirm three separate Vercel projects** (all linked to this repo), each with its
   app-specific Root Directory (table above) and "Include source files outside of the Root
   Directory" enabled, and install/build set to workspace-aware commands
   (`bun install --frozen-lockfile` at repo root, then per-app build).
7. **Assign per-app environment variables** in Vercel (see audit §6 map). **Least privilege:**
   - `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `OUTREACH_NOTIFICATION_ZONES` → **Workspace only.**
   - `RESEND_API_KEY` → Website (contact) **and** Workspace (outreach).
   - `TURNSTILE_SECRET_KEY`, `REVALIDATE_SECRET`, `ANALYTICS_INGEST_SECRET`, Upstash Redis
     vars → **Website only.**
   - `NEXT_PUBLIC_*` Supabase keys + admin display vars → the apps that render those screens.
   - Never prefix a true secret with `NEXT_PUBLIC_`. Never put service-role/Resend/cron secrets in
     a client bundle.
8. **Deploy Admin and Workspace (and their preview builds), then attach their own custom domains
   early — this is deliberate, and it does NOT touch `www.sahinpro.me` yet:**
   - Attach `workspace.sahinpro.me` → Workspace project. Verify the CRM entrypoint loads, auth
     gates hold, and lead CRUD is gated.
   - Attach `admin.sahinpro.me` → Admin project. Verify `/admin/...` CMS paths work and gate holds.
   - **Website is NOT deployed to production in Stage A.** The existing Website deployment keeps
     serving `www.sahinpro.me`, including the old cron route, until Stage C.

   **Two distinct endpoints — do not conflate them (FR-001):**

   | Purpose                              | Endpoint                                      | The ONLY safe Stage A check                                                                                                         |
   | ------------------------------------ | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
   | Cron route/middleware reachability   | `GET /api/cron/outreach-windows`              | **Unauthenticated** GET → expect `401` (rejected by `requireCron`, never reaches the runner). **Never** send a valid `CRON_SECRET`. |
   | Outreach notification content render | `POST /api/admin/outreach-notifications/test` | Admin bearer + **explicit `mode:"preview"`** → confirm rendered subject/text/HTML. **Never** `mode:"send"`.                         |
   - The cron handler has **no `mode:"preview"` path.** An _authorized_ `GET /api/cron/outreach-windows`
     immediately runs `runDailyOutreachDigest(new Date())`, which attempts to send the **single Daily
     Outreach Digest** (at most one per BD day — later ticks that day skip via the daily claim). It
     never emails prospects, but it can send a real owner digest. Stage A proves the endpoint is
     deployed **only** via the `401` from an unauthenticated request; a `200`/`207` means a genuine
     digest run happened and is **not** a no-send test.
   - Only the separate `/admin/outreach-notifications/test` endpoint supports `preview`/`send`; use it
     in `preview` to validate email rendering.

**Gate A→B:** do not proceed until the Workspace `/api/cron/outreach-windows` route is confirmed
**deployed and reachable via an unauthenticated `401` probe** (no valid `CRON_SECRET`) on
`workspace.sahinpro.me`, the admin allowlist is confirmed for Admin + Workspace (and Website, if it
uses the admin bypass — see Stage A.4/FR-004), the old `www.sahinpro.me/api/cron/outreach-windows`
is **still healthy on its scheduled ticks**, and the CRM JSON export is captured **and merged into
Workspace via “Merge safely” (Stage A.5) with counts verified**.

---

## Stage B — Cron transition (owner, Supabase Vault, reversible) — Website production NOT yet replaced

**Do this ONLY after Stage A's Workspace cron route is confirmed reachable via an unauthenticated
`401` probe** (never by an authorized run — an authorized call sends real outreach). Exactly one
authoritative target at all times; **no second cron job, no `pg_cron` change, no schedule change.**
You are only repointing the URL the _existing_ job calls.

- **Vault secret name to update:** `outreach_cron_endpoint_url`
- **Existing value:** `https://www.sahinpro.me/api/cron/outreach-windows`
- **Intended new value:** `https://workspace.sahinpro.me/api/cron/outreach-windows`
- The bearer value lives separately in `outreach_cron_secret` — **never printed, never rotated**
  as part of this move.

Manual steps (owner, via approved Supabase process — SQL Editor or Vault UI; the agent does not
execute these):

1. **Confirm the current (old Website) target is still healthy** by inspecting the status of the
   most recent **naturally scheduled** `pg_cron` invocation to the current
   `outreach_cron_endpoint_url` in `net._http_response` (expect `200`/`207`). Do **not** verify by
   manually issuing an authorized `GET` to `www.sahinpro.me/api/cron/outreach-windows` — that would
   run the live runner and send real notifications. Do not modify the pg_cron job.
2. **Back up the current Vault secret id** for `outreach_cron_endpoint_url`:
   `select id from vault.secrets where name = 'outreach_cron_endpoint_url';` (record the id, not
   the decrypted value).
3. **Update only the URL**, preserving the name and note:
   ```sql
   select vault.update_secret(
     (select id from vault.secrets where name = 'outreach_cron_endpoint_url'),
     'https://workspace.sahinpro.me/api/cron/outreach-windows',
     'outreach_cron_endpoint_url',
     'GET endpoint invoked by pg_cron every 3 minutes (workspace)');
   ```
4. **Verify without leaking secrets:**
   - Wait for the next scheduled tick. Check `net._http_response` (or the `extensions` schema)
     for the request status to the **new** host — expect `200`/`207`, not `401`/`404`/`503` or a
     connection error.
   - Confirm `pg_cron.job` still lists exactly one `outreach-window-reminder-tick`
     (`select jobid, jobname, schedule from <cron_schema>.job;`). Do not create a new job.
   - Confirm no duplicate sends: the digest's atomic daily claim in `outreach_window_claims`
     guarantees at most one digest per BD day even if the job still fires at the old cadence; check
     counts are stable.
   - **This is the real production path, not a no-send test.** The naturally scheduled run will send
     **one Daily Outreach Digest** to the owner if any window falls in the next 24h and the day is not
     yet claimed (otherwise it skips). Verify via the recorded HTTP status and delivery rows only —
     never by manually invoking the endpoint with a valid `CRON_SECRET`.
5. If the new host fails, execute the Stage E **cron rollback** immediately (restore the URL from
   the id saved in step 2). The old Website deployment is still live on `www.sahinpro.me` (Stage C
   has not run), so a rollback returns cron to a known-good target with zero downtime.

### Decision: no code proxy needed

With this ordering, a temporary compatibility proxy on the Website is **not required**: the old
`www.sahinpro.me` cron route stays live until Stage C, and cron has already been repointed to the
verified Workspace endpoint in Stage B, so there is no window in which the schedule points at a
missing route. Per the task constraints, a proxy must **not** be built unless this owner-operated
sequence is shown to be unsafe. It is not. Should the owner later be unable to repoint Vault before
deploying the Website, the fallback is simply to **delay Stage C** — not to add code. Do not add
`SUPABASE_SERVICE_ROLE_KEY` to Website or reintroduce the cron handler there just to preserve the
old URL.

**Gate B→C:** do not deploy the new Website to production until the cron tick against
`workspace.sahinpro.me/api/cron/outreach-windows` has been observed succeeding (200/207) and
exactly one job is confirmed.

---

## Stage C — Website production deployment (owner) — only after Stage B is verified

Now that pg_cron no longer depends on `www.sahinpro.me/api/cron/outreach-windows`, the new Website
build (which does not mount that route) can go live safely. By this point PR #4 is already merged to
`main`; the merge was harmless because **Auto-assign Custom Production Domains** was OFF (Stage 0),
so the new production build went **Staged** and never took over the domains. The new code goes live
ONLY when the owner promotes it here.

1. Open the **Website** project's **Deployments** page.
2. Identify the **Staged** Production deployment corresponding to the merged PR #4 commit (its
   commit SHA should match the `main` HEAD from the merge; the Stage 0 pre-merge deployment ID/SHA
   is the one being replaced).
3. Confirm its build status is **Ready**, and — per the FF-001 deployment rule — confirm it was
   built with the **correct Production environment variables** (check its Vercel build log → Environment
   Variables). If a required var was missing/changed after this build was created, do **not** promote
   it: keep Auto-assign OFF, trigger a new Production build, and promote the NEW Staged deployment
   instead. Never promote a Staged build made with wrong or missing env.
4. Open the deployment menu (the ellipsis …) and select **Promote**.
5. In the **Promote** dialog, confirm the deployment and select **Promote**. Per Vercel's documented
   workflow, promotion is instant and **does not require a rebuild** — the existing staged build is
   simply assigned to your production domains and marked **Current**
   (<https://vercel.com/docs/deployments/promoting-a-deployment>).
6. Verify `www.sahinpro.me` + `sahinpro.me` now serve the newly promoted deployment; the
   `sahinpro.me` → `www.sahinpro.me` permanent redirect is preserved by the website
   middleware/`vercel.json`. Verify TLS and the canonical redirect.
7. Confirm the new Website and public APIs work: public routes render identically, public API routes
   respond, and **cache revalidation**
   works — an Admin/Workspace content mutation calls the Website `/api/revalidate` via the absolute
   `WEBSITE_URL` with `x-revalidate-token`; a relative call does NOT hit the admin/workspace origin;
   a timeout/non-2xx returns a retryable `revalidationFailed` flag without rolling back saved
   content. `REVALIDATE_SECRET`/`WEBSITE_URL` stay server-only.
8. Only after the promoted deployment is confirmed healthy, **turn Auto-assign Custom Production
   Domains back ON** (Settings → Environments → Production → Branch Tracking) so future production
   deployments are assigned to the domains automatically again.
9. Keep the **previous public-site Website deployment recoverable** throughout the validation window
   (do not delete the old deployment/project yet) — it is the cron-rollback target (see Stage E).

---

## Stage D — Legacy CMS/CRM redirects on the public host (owner)

With the Website live and Admin/Workspace already reachable on their own domains, add explicit,
tested redirects so old bookmarks survive. **These are owner-operated Vercel/`vercel.json`/
middleware rules on the public host** — the Website code does not currently ship these redirects,
and adding them is deliberately left as the smallest owner-side step rather than a code change here.

1. **Old CRM paths:** `www.sahinpro.me/admin/leads*` → `https://workspace.sahinpro.me/…`
   (CRM routes to Workspace).
2. **Old CMS paths:** `www.sahinpro.me/admin/*` (CMS) → `https://admin.sahinpro.me/admin/*`
   (to Admin).
3. **Do NOT blanket-redirect all `/admin/*` to one app** — distinguish CRM vs CMS first
   (audit §8). Match `/admin/leads*` before the broader `/admin/*` rule.
4. **Preserve query strings** (auth `from`, ids, filters). **Prevent redirect loops:** the
   destination host must not re-match the source rule (rules are host-scoped to `www.sahinpro.me`).
5. Verify login callbacks and deep links resolve within the destination app (no open redirects),
   and `noindex` is present on Admin & Workspace.
6. **Cloudflare / DNS:** do NOT change proxy or records unless the owner, after reviewing the
   current target vs Vercel's requested record, decides to. The intended split uses **separate
   Vercel projects with their own custom domains**, not Cloudflare path routing on a single origin.

---

## Stage E — Post-cutover validation and rollback (owner verifies, records — no secrets)

**Acceptance checklist:**

- [ ] Public website visually identical; canonical SEO, sitemap/robots/llms, favicons/fonts intact.
- [ ] `sahinpro.me`→`www`, and legacy `.pro.bd` 301s still work.
- [ ] Workspace reachable at its host; renders the **CRM**, not the portfolio.
- [ ] Admin reachable at its host; all CMS features (projects, testimonials, media, analytics,
      settings, resume) work.
- [ ] **Cron continuity:** last scheduled tick hit `workspace.sahinpro.me` with 200/207; exactly
      **one** `outreach-window-reminder-tick` job; **no duplicate notifications** produced by the
      transition.
- [ ] **Legacy redirects:** `/admin/leads*` → Workspace and `/admin/*` (CMS) → Admin, with query
      strings preserved and no loops.
- [ ] **Lead data verified:** the old-origin JSON backup was imported on Workspace with **Merge
      safely** (never Replace all) and the Review-dialog counts matched; the board total equals the
      backup `count` minus skipped (preserved) records. Discrepancies must be reported. The JSON
      export stays with the owner until cloud verification is complete; the legacy browser
      IndexedDB copy is unused by the app and needs no action.
- [ ] **Authorization (fail-closed):** an unset/blank `NEXT_PUBLIC_ADMIN_EMAIL` denies everyone;
      an authenticated but non-allowlisted user and an unauthenticated user cannot read/mutate
      leads OR CMS data via UI **or** direct Supabase REST; RLS denies; privileged API routes return
      401/403; a missing/failed authz lookup fails CLOSED (never grants). (The DB-backed
      `requireDbAdmin` rollout in Appendix B is a **deferred, separate** change.)
- [ ] **Cache revalidation (Option A, audit §11):** correct tags flushed on the Website; a relative
      call does NOT hit the admin/workspace origin; timeout/non-2xx returns retryable
      `revalidationFailed` without rolling back saved content. `REVALIDATE_SECRET`/`WEBSITE_URL`
      are server-only (not `NEXT_PUBLIC_`, not in any browser bundle).
- [ ] Contact form, page-view ingestion, resume download/storage all pass smoke checks.
- [ ] Record final commit SHAs per app, Vercel project↔domain mapping, verification timestamp, and
      any unresolved issues. **No secret values in this record.**

**Rollback (manual, reversible, non-destructive).** Never use `git reset --hard` / `git clean -fd`.
Keep the previous public-site Website deployment recoverable throughout the **entire** cutover and
rollback window (Stage C.9) — it is the cron fallback target.

_Cron rollback — the ORDER is critical (FR-003): do NOT restore the old Vault URL until the old
Website is serving the old cron handler again._ If the Workspace cron endpoint is failing (Stage B
completed; Stage C may or may not have replaced the Website), do all of the following, in this exact
order:

1. **Restore / re-attach the previous known-good Website deployment** to `www.sahinpro.me` /
   `sahinpro.me` (the one kept recoverable in Stage C.4). Skip only if Stage C never ran and the old
   Website is still live on those domains.
2. **Verify `https://www.sahinpro.me/api/cron/outreach-windows` is serving the old cron handler
   again** — an unauthenticated `GET` returning `401` proves the route exists; confirm the handler
   is the old one. Do **not** invoke it with a valid `CRON_SECRET` as a test.
3. **Only then restore `outreach_cron_endpoint_url` to the old Website URL** using the id saved in
   Stage B step 2:
   ```sql
   select vault.update_secret(
     (select id from vault.secrets where name = 'outreach_cron_endpoint_url'),
     'https://www.sahinpro.me/api/cron/outreach-windows',
     'outreach_cron_endpoint_url',
     'GET endpoint invoked by pg_cron every 3 minutes');
   ```
4. **Observe the next naturally scheduled `pg_cron` invocation** (do not create, schedule, or
   manually trigger any job).
5. **Confirm the scheduled run is healthy (`200`/`207`), that exactly one
   `outreach-window-reminder-tick` job remains, and that no duplicate notifications** were produced
   during the brief overlap.

Never modify `outreach_cron_secret`. Never unschedule/reschedule the job. Never perform step 3
before steps 1–2 have re-established the old cron route — otherwise the schedule points at a Website
that no longer serves the handler and begins 404ing.

_Website/domain + redirect rollback (Stage C/D) — folded into the same sequence:_ re-attaching the
old Website (step 1) is also the domain rollback — Vercel's documented Instant Rollback assigns your
domains to the previous deployment without a rebuild. Then: detach `workspace.sahinpro.me` /
`admin.sahinpro.me` if unstable; remove/disable any added legacy redirects if they loop; if you had
turned **Auto-assign Custom Production Domains** back ON (Stage C.8), **turn it OFF again** until the
rollback is complete (so a later production build cannot silently reassign the domains); and do
**not** delete the new deployments or the browser-local lead export
backups until stability is re-established.

_Data:_

- Supabase schema, `leads` rows, `admin_emails`, RLS policies and `outreach_window_notifications`
  are **untouched by this migration** — no data rollback needed.
- Browser-local leads were exported (Stage A.5) and never deleted; the conflict-safe upload never
  overwrote a newer cloud record. Re-import on the intended origin if needed. Preserve the export +
  any audit logs and note the reason for rollback.

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

## Appendix B — DB-authoritative rollout (DEFERRED, separate future change)

**Not part of this cutover.** FC-001 only made the existing env-backed shared gate fail-closed. The
full DB-authoritative rollout below is the future `requireDbAdmin` project and remains gated on the
owner. **No step is executed by the agent.** Steps 1–4 are code (reversible via git revert/
redeploy); step 5 is owner-executed production SQL, gated on step 1. The database is authoritative
throughout; the env gate never grants once the DB-only gate is enabled — the env result is only
**observed** (shadow), never used to allow access.

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
- Vercel staging & promoting a production deployment (Auto-assign Custom Production Domains OFF →
  Promote, no rebuild): https://vercel.com/docs/deployments/promoting-a-deployment
- Next.js `transpilePackages`: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
