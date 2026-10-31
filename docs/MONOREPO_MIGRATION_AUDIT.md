# Monorepo Migration Audit — Phase 0 Deliverable

**Repository:** `sahinpro/Portfolio-by-sahinpro`
**Prepared by:** Qoder migration agent (read-only inspection; no code moved, no infra touched)
**Date:** 2026-10-29

> Every finding is labelled **VERIFIED** (proven from the checked-out tree, with path/line
> evidence), **DECISION** (an intended choice this migration makes), or
> **BLOCKER/UNKNOWN** (cannot be proven from source and needs the owner or a live
> dashboard). "Probably" is never written as fact.

---

## 0. Baseline snapshot (Phase 0 step 1–2)

| Item             | Value                                                                                            | Status   |
| ---------------- | ------------------------------------------------------------------------------------------------ | -------- |
| Branch           | `main` tracking `origin/main`                                                                    | VERIFIED |
| HEAD commit      | `8be884bb66389699b7a7635e85189d0950a0abc3`                                                       | VERIFIED |
| `git log -1`     | `8be884b Project sucessfully shifted to bun runtime`                                             | VERIFIED |
| Dirty tree       | Only untracked file: `QODER_MONOREPO_MIGRATION_PLAN.md` (this brief). No modified tracked files. | VERIFIED |
| `bun --version`  | `1.4.2`                                                                                          | VERIFIED |
| `node --version` | `v24.21.0`                                                                                       | VERIFIED |

**Dirty-tree note:** The working tree is effectively clean. `QODER_MONOREPO_MIGRATION_PLAN.md`
is the user-supplied spec and must be preserved. No pre-existing user edits to source are at
risk from this audit. The plan file currently open in the editor
(`supabase/migrations/20261023180000_supabase_cron_outreach_windows.sql`) is committed and
unmodified.

### Baseline verification results (commands actually run)

| Command                                    | Result  | Notes                                                                                            |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| `bun install --frozen-lockfile`            | ✅ PASS | "Checked 608 installs … (no changes)". Lockfile intact, not regenerated.                         |
| `bun run type-check` (`bunx tsc --noEmit`) | ✅ PASS | exit 0                                                                                           |
| `bun run lint` (`bunx eslint .`)           | ✅ PASS | **0 errors, 21 warnings** — all pre-existing (`<img>`/`<a>`/hook-deps). Not caused by this work. |
| `bun run test:outreach`                    | ✅ PASS | 11 pass / 0 fail (windowScheduler + zonesConfig)                                                 |
| `bun run check:vercel-api`                 | ✅ PASS | "OK: no deployable handlers under api/"                                                          |
| `bun run build`                            | ✅ PASS | exit 0; full route table generated                                                               |

**No pre-existing failures.** The tree is a healthy green baseline; anything that breaks after
the split is a migration regression and must be fixed, not hidden.

Additional test files exist that the official `test:outreach` script does **not** run:
`api/_lib/outreach/outreachEmail.test.ts`, `reminderClaim.test.ts`, `scheduleConfig.test.ts`.
**DECISION:** keep the official script as the gate; run the full set ad-hoc in Phase 5 to avoid
silently narrowing coverage.

Build route summary (VERIFIED from build log): public pages `○/●` static/SSG; all
`/admin/*` and `/api/*` are `ƒ` (dynamic). Middleware = 34.5 kB.

---

## 1. Source & route inventory

### 1.1 App Router — public pages (VERIFIED)

`src/app/{layout,page,not-found}.tsx`, `about/`, `contact/`, `projects/` (+ `[slug]/`), `services/`.
Canonical host `https://www.sahinpro.me` (`src/constants/site.ts:3`).

### 1.2 App Router — admin/CRM pages (VERIFIED)

All under `src/app/admin/`, wrapped by:

- `admin/layout.tsx` — `export const dynamic = "force-dynamic"` (no static cache for admin).
- `admin/login/page.tsx` → `AdminLoginPage`.
- `admin/(protected)/layout.tsx` → `AdminProtectedLayout` (client auth gate, see §4).

Protected routes: `(protected)/page.tsx` (dashboard), `analytics`, `media`, `settings`,
`settings/resume`, `projects` (+`/new`,`/[id]`), `testimonials` (+`/new`,`/[id]`),
`leads` (+`/new`,`/[id]`).

### 1.3 Route-mounting discrepancy — RESOLVED (VERIFIED, corrects plan §3)

Plan warned that `src/app/admin/(protected)/leads/page.tsx` returns `null`. Trace shows this is
the standard Next.js **layout-renders-the-shell** pattern, not a broken/unmounted CRM:

- `leads/layout.tsx` renders `<AdminLeadsListPage>{children}</AdminLeadsListPage>`.
- `AdminLeadsListPage` is the list shell and renders `{children}` at
  `src/admin/pages/AdminLeadsListPage.tsx:797`.
- `leads/page.tsx` returns `null` so the URL `/admin/leads` shows only the list shell.
- `leads/new/page.tsx` → `AdminLeadFormPage`; `leads/[id]/page.tsx` → `AdminLeadFormPage leadId`.

The same pattern is used by `projects` and `testimonials` (their `page.tsx` also return `null`
and the list is in `layout.tsx`). **Conclusion: the Lead CRM is mounted and reachable at
`/admin/leads` today.** It is a real, working feature — it must be preserved, not assumed absent.

### 1.4 API route handlers (VERIFIED) — 13 total

| Method/Path                                   | File                                     | Auth                           | Secrets read (server)                                    |
| --------------------------------------------- | ---------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `POST /api/contact`                           | `src/app/api/contact/route.ts`           | Turnstile + rate-limit         | RESEND, TURNSTILE*SECRET, CONTACT*\*                     |
| `POST /api/pageview`                          | `src/app/api/pageview/route.ts`          | ingest secret                  | ANALYTICS_INGEST_SECRET, supabase url                    |
| `POST /api/revalidate`                        | `src/app/api/revalidate/route.ts`        | x-revalidate-token             | REVALIDATE_SECRET (+ NEXT_PUBLIC variants)               |
| `POST /api/admin/flush-cache`                 | `…/admin/flush-cache/route.ts`           | `isAllowedAdminEmail` (bearer) | supabase pub/anon key                                    |
| `GET/PUT /api/admin/outreach-schedule`        | `…/outreach-schedule/route.ts`           | `isAuthorizedAdmin`            | **SUPABASE_SERVICE_ROLE_KEY**                            |
| `GET/PUT /api/admin/outreach-planner-zones`   | `…/outreach-planner-zones/route.ts`      | `isAuthorizedAdmin`            | **SUPABASE_SERVICE_ROLE_KEY**                            |
| `POST /api/admin/outreach-notifications/test` | `…/outreach-notifications/test/route.ts` | `isAuthorizedAdmin`            | RESEND (via sendOutreachWindowEmail)                     |
| `GET /api/cron/outreach-windows`              | `…/cron/outreach-windows/route.ts`       | `CRON_SECRET` bearer/header    | CRON_SECRET, SERVICE_ROLE (via runOutreachNotifications) |
| `GET /api/public/projects`                    | `…/public/projects/route.ts`             | public                         | —                                                        |
| `GET /api/public/testimonials`                | `…/public/testimonials/route.ts`         | public                         | —                                                        |
| `GET /api/public/settings`                    | `…/public/settings/route.ts`             | public                         | —                                                        |
| `GET /api/public/resume`                      | `…/public/resume/route.ts`               | public                         | —                                                        |
| `GET /api/public/resume/file`                 | `…/public/resume/file/route.ts`          | public                         | upstream file fetch                                      |

`api/_lib/**` are non-deployable helpers (confirmed by `check:vercel-api`).

---

## 2. Route call graph & cross-origin dependency (VERIFIED)

Relative `fetch("/api/…")` call-sites (these resolve to the **calling app's own origin** after
the split — the central behavioral risk of the migration):

| Caller file (origin app)                        | Target API                          | Owning feature    | Post-split requirement                                 |
| ----------------------------------------------- | ----------------------------------- | ----------------- | ------------------------------------------------------ |
| `src/lib/submitContact.ts:34`                   | `/api/contact`                      | Website           | Keep next to website. ✅ same-origin.                  |
| `src/lib/recordPageView.ts:6`                   | `/api/pageview`                     | Website           | Keep next to website. ✅                               |
| `src/lib/publicDataCache.ts:83`                 | `/api/admin/flush-cache`            | **Cross-cutting** | see §2.1                                               |
| `src/lib/publicDataCache.ts:103`                | `/api/revalidate`                   | Website           | website revalidation                                   |
| `src/admin/lib/leads/plannerCloudSync.ts:23`    | `/api/admin/outreach-planner-zones` | Workspace         | CRM client → outreach API; must co-locate in Workspace |
| `src/admin/lib/leads/plannerCloudSync.ts:41,60` | `/api/admin/outreach-schedule`      | Workspace         | CRM client → outreach API; must co-locate in Workspace |

### 2.1 `publicDataCache.ts` is a shared browser module that straddles two apps (VERIFIED)

`src/lib/publicDataCache.ts` is imported by **both** public site code
(`src/hooks/usePublicData.ts`, `usePublicCacheVersion.ts`, `src/data/publicSupabase.client.ts`,
`src/components/layout/PublicSiteGate.tsx`) **and** CMS admin pages
(`AdminProjectFormPage`, `AdminProjectsListPage`, `AdminTestimonialFormPage`,
`AdminTestimonialsListPage`, `AdminResumePage`, `AdminSiteSettingsPage`).

Its `flushServerCache()` calls `/api/admin/flush-cache` then falls back to `/api/revalidate`.
Both endpoints flush the **website's** Redis/Next cache. After the split, an Admin-hosted call to
a relative `/api/revalidate` would hit the **admin** origin, not the website — a silent behavior
break (plan §5.2 explicitly warns about this).

**DECISION (Phase 2+):** the flush/revalidate endpoints are **website-owned cache
infrastructure**. Admin (and Workspace) must call the **website deployment's absolute URL** with
a server-side secret, never a relative path. This module must be split: the read-cache helpers
stay shared; the `flushServerCache` cross-origin call becomes an explicitly-configured website
base URL. **BLOCKER/UNKNOWN:** the exact mechanism (whether the browser should call the website
directly, or route through each app's own server with the website secret) needs an owner
decision — see §6 B2.

### 2.2 Public site imports admin code — cross-boundary coupling (VERIFIED, plan-critical)

Files outside `src/admin/` that import `@/admin/*`:

- **Types/data (genuinely shared):** `@/admin/types/database` used by 10 public files
  (`src/data/publicSupabase*.ts`, `src/data/projectUiMapper.ts`, `src/hooks/usePublishedProjects.ts`,
  `usePublicTestimonials.ts`, `views/HomePage.tsx`, `views/ProjectsPage.tsx`,
  `screens/sections/{FeaturedProjects,Testimonials}Section`). `@/admin/lib/projectMappers` +
  `@/admin/lib/slug` used by `src/data/projectUiMapper.ts`, `src/data/publicSupabase.ts`,
  `src/lib/projectPaths.ts`.
- **Auth helper (feature gate):** `src/components/layout/PublicSiteGate.tsx:3` imports
  `isAllowedAdminEmail` from `@/admin/lib/authHelpers` to compute an admin-preview bypass
  (`PublicSiteGate.tsx:54`).

**DECISION:** `types/database`, `projectMappers`, `slug`, `testimonialMappers` are pure/app-neutral
→ move to `packages/shared`. `isAllowedAdminEmail` is used by Website, Admin, and the API helper →
`packages/shared` auth-helper contract (with its env read kept per-app). The Website **must not**
end up importing `@/admin/*` after the split; these are the exact edges to sever.

---

## 3. Module inventory (VERIFIED, top-level buckets)

- `src/app/**` — App Router (public + admin + api). Splits across website/admin/workspace.
- `src/admin/**` — CMS + Lead CRM implementation (pages, components, hooks, lib, schemas, types).
  Contains BOTH CMS (projects/testimonials/media/settings/resume/analytics) and CRM (leads/\*).
- `src/components/**` (incl. `ui/` = 24 shadcn primitives) — used by website AND admin
  (admin imports `@/components/ui/*` 60+ times) → shared UI primitives.
- `src/lib/**`, `src/hooks/**`, `src/data/**`, `src/constants/**`, `src/utils/**`, `src/theme/**` —
  mixed; public data layer + shared utils + website cache infra.
- `src/screens/sections/**`, `src/views/**` — public portfolio section components (website-only).
- `api/_lib/**` — server helpers for API routes (contact, outreach, cron, rate-limit, supabase
  service client, turnstile, resend). Split: outreach+cron → workspace; contact/public/revalidate →
  website. `adminRouteAuth`, `cronAuth`, `supabaseService`, `rateLimit` are shared server helpers.
- `scripts/**` — `generate-favicons.mjs`, `generate-sitemap.mjs` (website build-time),
  `check-vercel-api-function-count.mjs`.
- `supabase/**` — migrations + edge function `record-page-view` (shared infra, NOT per-app).

---

## 4. Authorization matrix (VERIFIED) — security-sensitive

Three distinct admin-check implementations exist, plus the database RLS gate. They are **not
identical** — this is the highest-risk area and must be preserved, not silently unified.

| Layer            | File                                                  | Allowlist source                                    | Behavior when allowlist env unset              | Fail mode                                     |
| ---------------- | ----------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| Client UI gate   | `src/admin/lib/authHelpers.ts` `isAllowedAdminEmail`  | `NEXT_PUBLIC_ADMIN_EMAIL` via `src/lib/env.ts:20`   | **returns `true` for any user with an email**  | **FAIL-OPEN**                                 |
| API route helper | `api/_lib/adminRouteAuth.ts` `isAuthorizedAdmin`      | `NEXT_PUBLIC_ADMIN_EMAIL` (direct `process.env`)    | **returns `true` for any authenticated email** | **FAIL-OPEN**                                 |
| Route (inline)   | `src/app/api/admin/flush-cache/route.ts`              | uses `isAllowedAdminEmail`                          | same fail-open                                 | FAIL-OPEN                                     |
| Unused helper    | `src/admin/lib/requireAdminRequest.ts` `requireAdmin` | `isAllowedAdminEmail`                               | same fail-open                                 | **dead code — no importers found (VERIFIED)** |
| Database RLS     | `supabase/migrations/20261023120000_leads_table.sql`  | `public.admin_emails` table via `public.is_admin()` | **deny (no rows → no access)**                 | **FAIL-CLOSED**                               |

**VERIFIED inconsistency:** the application gate is **fail-open** (any signed-in email reaches
admin UI/APIs if `NEXT_PUBLIC_ADMIN_EMAIL` is unset), while Supabase RLS for `leads` is
**fail-closed** (only emails in `public.admin_emails` can read/write leads). A non-allowlisted
signed-in user could pass the app gate but still be denied by RLS on lead data.

**BLOCKER B1 (authz semantics):** Which source is authoritative for the split —
`NEXT_PUBLIC_ADMIN_EMAIL` (single env email) or the `public.admin_emails` table (DB list)? The
code cannot prove which is intended to win; they are used by different layers. The plan (§5.3)
says **do not change authorization semantics without an owner decision.** This migration will
**preserve the current behavior verbatim** (env gate + DB RLS unchanged, both fail modes intact)
and will NOT unify, relax, or bypass either. Admin and Workspace will each keep the same gate.
See §6.

Supabase browser auth uses `@/utils/supabase` single client (anon/public key, `persistSession`
default) — **origin-scoped**. Separate subdomains ⇒ separate sign-in sessions. **DECISION:** do
NOT promise shared login/SSO across `admin.`/`workspace.`; keep per-app login. No cookie-sharing
implemented.

---

## 5. Data map (VERIFIED)

| Data                                                 | Where persisted                                                            | Access path                                                                        | Migration action for split                                 |
| ---------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| Projects, testimonials, resume, site_settings, media | Supabase `public.*`                                                        | anon key + RLS via `src/data/publicSupabase.*`, admin pages, `/api/public/*`       | None (schema untouched). Both apps reuse same Supabase.    |
| `leads` table                                        | Supabase `public.leads`                                                    | **Browser direct** via `@/utils/supabase` + RLS `is_admin()` (`leadRepository.ts`) | Move repo code to Workspace. Schema/RLS untouched.         |
| `site_settings` schedule config                      | Supabase `site_settings` (keys `outreach_schedule_config`, planner zones)  | Server `SUPABASE_SERVICE_ROLE_KEY` in outreach APIs                                | APIs move to Workspace; keys/rows unchanged.               |
| `outreach_window_notifications`                      | Supabase table; dedupe unique on `(iana_timezone,local_date,window_start)` | `notificationLog.ts` upsert `onConflict`                                           | Unchanged; dedupe must stay single-target (see cron §5.5). |
| Browser-local leads                                  | IndexedDB `lead-crm-db` (v2, stores `leads` + `lead_prefs`)                | `src/admin/lib/leads/leadDb.ts`                                                    | **ORIGIN-SCOPED.** Must NOT auto-migrate. See §5.1.        |

### 5.1 Lead browser-data safety (VERIFIED)

`leadDb.ts` opens IndexedDB `lead-crm-db` version 2 (`leadDb.ts:20-22`). Upload flow
`leadCloudMigration.ts` is idempotent: it upserts local rows into Supabase by `id`, then
**independently re-reads the cloud and compares a 19-field fingerprint**; local rows are
**deliberately never deleted** (comments `leadCloudMigration.ts:8-15`). `fingerprint()` spans
business/name/…/updatedAt. Status type reports `localCount`, `pendingIds`, `syncedCount`,
`cloudOnlyCount`.

**Risk:** today the CRM runs only on `www.sahinpro.me` (route `/admin/leads`). After the move the
CRM entrypoint becomes `workspace.sahinpro.me`. IndexedDB is per-origin, so any existing local
leads on `www.sahinpro.me` **will not automatically appear** on `workspace.sahinpro.me`.
**DECISION:** the cutover runbook must include a manual export-on-old-origin → import/upload-on-new-origin
step with recorded counts. Never assume zero local leads (agent cannot inspect the owner's
browser). Preserve the non-destructive property: no auto-delete of the local copy.

### 5.5 Cron ownership (VERIFIED)

- `GET /api/cron/outreach-windows` (`dynamic = "force-dynamic"`, `runtime = "nodejs"`) checks
  `CRON_SECRET` bearer/`x-cron-secret` (`cronAuth.ts`) then runs `runOutreachNotifications`.
- Dedupe: `notificationLog.ts:42-43` upsert `onConflict: "iana_timezone,local_date,window_start"`.
- Supabase `pg_cron` job `outreach-window-reminder-tick` (every minute) reads Vault secrets
  `outreach_cron_endpoint_url` (example value `https://www.sahinpro.me/api/cron/outreach-windows`)
  and `outreach_cron_secret`, then `pg_net.http_get` with `Authorization: Bearer <secret>`
  (`20261023180000_supabase_cron_outreach_windows.sql:27,96-136,199-200`).

**DECISION:** the endpoint belongs to **Workspace** (feature-aligned). But **this migration does
NOT touch Vault, does NOT create a second cron job, and does NOT run SQL.** The current website
endpoint and the Vault URL stay exactly as-is until Workspace has a verified production domain and
smoke tests. The runbook documents the manual, reversible Vault URL update
(`outreach_cron_endpoint_url` → `https://workspace.sahinpro.me/api/cron/outreach-windows`) with
old/new URL, secret name, no-secret verification and rollback. **Exactly one authoritative target
at all times.**

---

## 6. Environment-variable map (VERIFIED names only — no values)

Grouped by actual reader. `S`=server-only, `C`=client-bundled (`NEXT_PUBLIC_`).

| Variable                                                                                                                                          | Reader(s)                                                                                    | S/C                        | App needing it                               | Required/Optional             |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------- | -------------------------------------------- | ----------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                                                                                                                        | env.ts, supabase.ts, requireAdmin\*, adminRouteAuth, pageview, outreach APIs                 | C                          | Website, Admin, Workspace                    | Required                      |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` / `…_ANON_KEY`                                                                                     | same fallback chain                                                                          | C                          | all three                                    | Required                      |
| `NEXT_PUBLIC_ADMIN_EMAIL`                                                                                                                         | authHelpers/env, adminRouteAuth                                                              | C                          | Admin, Workspace (and Website gate)          | Optional (fail-open — see B1) |
| `NEXT_PUBLIC_ADMIN_DISPLAY_NAME` / `_AVATAR_URL` / `_SUPABASE_STORAGE_QUOTA_GB`                                                                   | env.ts (admin shell)                                                                         | C                          | Admin, Workspace                             | Optional                      |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`                                                                                                                  | env.ts, contact                                                                              | C                          | Website                                      | Optional                      |
| `TURNSTILE_SECRET_KEY`                                                                                                                            | `api/_lib/turnstile.ts`                                                                      | S                          | Website                                      | Optional                      |
| `SUPABASE_SERVICE_ROLE_KEY`                                                                                                                       | supabaseService, outreach-schedule, planner-zones                                            | S                          | **Workspace only**                           | Required for outreach         |
| `RESEND_API_KEY`                                                                                                                                  | resendClient, outreach                                                                       | S                          | Website (contact), Workspace (outreach)      | Required                      |
| `CONTACT_NOTIFICATION_TO_EMAIL` / `_FROM_EMAIL` / `RESEND_CONTACT_TEMPLATE_ID` / `CONTACT_RATE_LIMIT_PER_MINUTE` / `CONTACT_RATE_LIMIT_WINDOW_MS` | `api/_lib/contact*`, `rateLimit`                                                             | S                          | Website                                      | Mixed                         |
| `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET`                                                                                                             | env.ts, pageview, recordPageView                                                             | **C (secret in browser!)** | Website                                      | ⚠ see B3                      |
| `ANALYTICS_INGEST_SECRET`                                                                                                                         | pageview route                                                                               | S                          | Website                                      | Optional                      |
| `NEXT_PUBLIC_REVALIDATE_SECRET`                                                                                                                   | env.ts, revalidate route                                                                     | **C (secret in browser!)** | Website                                      | ⚠ see B3                      |
| `REVALIDATE_SECRET`                                                                                                                               | revalidate route                                                                             | S                          | Website                                      | Optional                      |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`                                                                                             | `redisPublicCache.ts`                                                                        | U/S                        | Website                                      | Optional                      |
| `CRON_SECRET`                                                                                                                                     | cronAuth, cron route                                                                         | S                          | **Workspace only**                           | Required for cron             |
| `OUTREACH_NOTIFICATION_ZONES`                                                                                                                     | `zonesConfig.ts`                                                                             | S                          | Workspace                                    | Optional                      |
| `SITE_URL`                                                                                                                                        | `src/constants/site.ts` (hardcoded default `https://www.sahinpro.me`), `outreachEmail.ts:21` | S                          | Website (canonical), Workspace (email links) | Optional/overridden           |
| `NEXT_PUBLIC_SITE_URL`                                                                                                                            | outreachEmail legacy fallback                                                                | C                          | Website/Workspace                            | Optional                      |
| `VERCEL_URL`                                                                                                                                      | (read once)                                                                                  | —                          | build                                        | Vercel-provided               |
| Legacy `VITE_*` (supabase url/keys, analytics, admin, turnstile)                                                                                  | `next.config.ts:17-51`, revalidate/pageview                                                  | C                          | map to NEXT*PUBLIC*\*                        | deprecated aliases            |

⚠ **Note:** `api/_lib/outreach/outreachEmail.ts:8` hardcodes `DEFAULT_SITE_URL =
"https://www.sahinpro.me"` and email links use `SITE_URL`. Absolute links in outreach emails must
point to the intended host after the split — verify during Phase 4/5.

---

## 7. Config files to re-evaluate per app (VERIFIED)

- **`tsconfig.json`** root aliases `@/*`, `@/admin/*`, `@/components/*`, `@/views/*`, `@/hooks/*`,
  `@/lib/*`, `@/constants/*`, `@/utils/*` — all rooted at `./src/*`. Each app must re-point these
  at its own tree; `@/admin/*` must NOT silently resolve across apps (plan §6.6).
- **`vercel.json`** — legacy-host 301s (`sahin.pro.bd`, `www.sahin.pro.bd`), global security
  headers, `/admin/*` `X-Robots-Tag: noindex`, static asset cache headers, robots/sitemap/llms
  content-types. **DECISION:** legacy-host redirects + public SEO cache/content-type + noindex stay
  **Website**; Admin & Workspace each ship only security headers + `X-Robots-Tag: noindex` for
  their **root** (all routes private); do NOT duplicate the whole file into all three.
- **`next.config.ts`** — public-env injection, image `remotePatterns` (supabase storage, unsplash,
  wikimedia), `optimizePackageImports`, `.glb` webpack rule, removeConsole. Per-app copies trimmed
  to actual usage; website keeps 3D/glboptimizations.
- **Tailwind/PostCSS/ESLint/components.json** — verify each app can build with its own copy;
  shared UI primitives need the Tailwind config + `cn()` (`@/lib/utils`).

---

## 8. Intended app ownership (Phase 1 decision map)

**Website (`www.sahinpro.me`)** — public pages + sections/views, `/api/public/*`, `/api/contact`,
`/api/pageview`, `/api/revalidate`, `/api/admin/flush-cache` (website cache infra), `api/_lib`
contact/turnstile/rateLimit/resend, cache infra (`publicDataCache` read side, `redisPublicCache`,
`runPublicRevalidation`), middleware canonical/legacy redirects, `public/` assets, favicon/sitemap
scripts, website `vercel.json`.

**Workspace (`workspace.sahinpro.me`)** — Lead CRM (`src/admin/{pages,components,hooks,lib/schemas,types}/
leads*`, `leadRepository`, `leadDb`, `leadCloudMigration`, `leadBackup`, `plannerCloudSync`),
outreach APIs (`outreach-schedule`, `outreach-planner-zones`, `outreach-notifications/test`,
`cron/outreach-windows`), `api/_lib/outreach/**`, `cronAuth`, `supabaseService`; outreach-schedule
UI; CRM entrypoint at workspace root. Legacy `/admin/leads*` → Workspace redirects.

**Admin (`admin.sahinpro.me`)** — CMS dashboard, projects, testimonials, media, analytics,
settings, resume/CV, `src/admin/**` (minus leads/outreach), `AdminShell`/`AdminProtectedLayout`/
`AdminLogin`; keep `/admin/...` paths usable. `requireAdminRequest.ts` is dead code — **DECISION:**
leave it in place (do not delete as "cleanup") but flag it.

**packages/shared** — `@/components/ui/*` primitives + `cn()`/`lib/utils`, `@/admin/types/database`,
`projectMappers`/`testimonialMappers`/`slug`, `isAllowedAdminEmail` auth-helper contract, public-env
parsing (`env.ts`), pagination. Only extracted in Phase 2.5 after all three apps build, and only
after severing the Website→`@/admin` edges identified in §2.2.

---

## 9. Risks & blockers carried into the owner

- **B1 (RESOLVED by owner — Option B):** `public.admin_emails` / `public.is_admin()` is the
  intended authoritative source for Admin & Workspace; the app gate tightens to fail-closed.
  Design + compatibility/rollout plan in **§10**. No production SQL or live policy change is
  performed by this migration.
- **B2 (RESOLVED by owner — Option A):** the Website owns `/api/revalidate`; Admin/Workspace
  trigger it server-to-server via the Website's absolute URL with a server-only secret. Design in
  **§11**. No production env change or auto-deploy is performed by this migration.
- **B3 (SECURITY finding, pre-existing, NOT introduced here):** `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET`
  and `NEXT_PUBLIC_REVALIDATE_SECRET` are browser-bundled secrets (accepted as valid tokens by
  `/api/pageview` and `/api/revalidate`). Kept as-is to preserve behavior; flagged for owner.
  Do not rename/rotate during the split without a compatibility plan.
- **B4 (BLOCKER — browser lead data):** existing IndexedDB on `www.sahinpro.me` won't appear on
  `workspace.sahinpro.me`. Manual export/import with counts required (see runbook).
- **Live-state UNKNOWNs (cannot be proven from repo):** current Vercel project IDs, actual domain
  attachments, Cloudflare proxy/DNS state, real Vault secret values, current `admin_emails` rows,
  live cron status. All deferred to the manual cutover runbook (read-only verification steps).

**Phase 0 gate status:** migration map complete. Per the owner's Phase-2 decision (Option A),
**physical directory moves are still paused** pending review of §10–§13 and the runbook updates.
No source has been moved; the working tree and all user changes are preserved.

---

## 10. Authorization & RLS policy matrix — design for DB-backed authz (Option B)

**Goal (owner decision):** `public.admin_emails` + `public.is_admin()` become the single intended
source of truth for Admin & Workspace. The UI gate is _not_ a security boundary; every privileged
server action and every RLS-protected table must independently enforce it. Fail-closed. Do not
keep two allowlists that can disagree. Do **not** execute production SQL / alter live RLS in this
migration.

### 10.1 Per-resource policy audit (VERIFIED from repo vs LIVE-inspection required)

| Resource                        | Access path in code                                                                          | Repo-verified RLS?                                       | Effective write boundary — REPO MIGRATION (§13.1 = live)                                                                                                                                   | is_admin()-gated?                            | Mismatch / risk                                                                                                                                                                                                                                                                                          |
| ------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `leads`                         | browser client + RLS (`leadRepository.ts`)                                                   | **VERIFIED** (`20261023120000`)                          | `is_admin()` for SELECT/INSERT/UPDATE/DELETE                                                                                                                                               | ✅ yes                                       | none — already the target model                                                                                                                                                                                                                                                                          |
| `testimonials`                  | browser client + RLS (`AdminTestimonial*Page`)                                               | **VERIFIED** (`20260914120000`)                          | **Repo migration:** `WITH CHECK(true)`/`USING(true)` for any `authenticated` — **NOT the live boundary**                                                                                   | ❌ repo / ✅ **live = `is_admin()`** (§13.1) | **REPO-MIGRATION definition only.** The `20260914120000` migration grants CUD to any `authenticated`, but the **live DB already restricts testimonials writes to `is_admin()`** (§13.1) — tightened in the dashboard after the migration. Divergence recorded; **no automatic reconciliation proposed.** |
| `projects`                      | browser client + RLS (`AdminProject*Page`)                                                   | ❌ **NOT in repo** — table/policies created in dashboard | Referenced by `grant_is_admin_to_anon.sql` comment: `projects_admin_all` (defined WITHOUT `TO` → `{public}`, calls `is_admin()`) + `projects_public_read_published` (`status='published'`) | likely yes (admin policy)                    | **UNVERIFIED** exact definition — must read live before proposing any change.                                                                                                                                                                                                                            |
| `site_settings`                 | CMS: browser client (`siteSettings.ts` upsert). Outreach APIs: **service_role** (bypass RLS) | ❌ **NOT in repo**                                       | CMS write depends on live RLS (unknown); outreach write uses service-role key                                                                                                              | unknown                                      | **UNVERIFIED.** Need live policy; note outreach path intentionally bypasses RLS via service-role.                                                                                                                                                                                                        |
| `resume`                        | browser client + RLS (`AdminResumePage`)                                                     | ❌ **NOT in repo**                                       | unknown                                                                                                                                                                                    | unknown                                      | **UNVERIFIED.**                                                                                                                                                                                                                                                                                          |
| `page_views` (analytics)        | read via browser client (`AdminAnalyticsPage`); write via edge fn + `/api/pageview`          | ❌ **NOT in repo**                                       | unknown                                                                                                                                                                                    | unknown                                      | **UNVERIFIED** read/write policies.                                                                                                                                                                                                                                                                      |
| media / storage buckets         | browser client `supabase.storage.from(bucket)` (`storageUpload.ts`, `resumeStorage.ts`)      | ❌ **NOT in repo** (bucket policies live in dashboard)   | unknown                                                                                                                                                                                    | unknown                                      | **UNVERIFIED** storage read/upload policies — part of "authorization + storage" scope.                                                                                                                                                                                                                   |
| `outreach_window_notifications` | service_role only (`notificationLog.ts`)                                                     | **VERIFIED** (`20261023140000`)                          | REVOKE anon/authenticated; GRANT service_role                                                                                                                                              | n/a (no browser access)                      | correct: not exposed to browser roles                                                                                                                                                                                                                                                                    |
| `outreach_window_claims`        | service_role only                                                                            | **VERIFIED** (`20261023210000`)                          | REVOKE anon/authenticated; GRANT service_role                                                                                                                                              | n/a                                          | correct                                                                                                                                                                                                                                                                                                  |

**App-level guard boundary (VERIFIED, §4):** all CMS/CRM pages gate on the **env** check
(`isAllowedAdminEmail`, fail-open when `NEXT_PUBLIC_ADMIN_EMAIL` unset), while actual data writes are
governed by each table's RLS. §10.5 and the `authenticated:true` text above are the **repository
migration** definition, **not** the live boundary — §13.1 confirms **live** testimonials writes
already require `is_admin()`. The remaining gap is therefore the **app-level env gate** (fail-open),
which the §10.2 `requireDbAdmin` change tightens; **no live testimonials RLS change is needed** (and
none is proposed — repo/live divergence preserved).

### 10.2 Target authorization contract (client + server, fail-closed)

**Client (Admin & Workspace):** replace the env-only gate with an authoritative DB check that reuses
the existing, already-granted RPC — `supabase.rpc('is_admin')` (authenticated has EXECUTE
(`20261023120000:89`); anon EXECUTE granted in `20261028120000`). `is_admin()` compares the JWT
email claim to `public.admin_emails`, so client and DB agree by construction. On RPC **error** the
UI must **deny** privileged data but keep the existing 4-state machine
(`checking|authenticated|unauthenticated|error`) so a transient failure is a _retryable error_,
never silently "signed out" and never "authorized" (see practice memory "Auth Error Handling State
Distinction"). `NEXT_PUBLIC_ADMIN_EMAIL` becomes display-only, never an access grant.

**Server (every privileged API) — user-scoped JWT, NO service-role:** one shared helper
`requireDbAdmin(request)` (replaces the fail-open `isAuthorizedAdmin`/`isAllowedAdminEmail` on
routes). The **database decides**, using the caller's own verified JWT; a browser-supplied email is
never trusted:

1. extract the bearer token and verify it with a **public/publishable-key** client via
   `supabase.auth.getUser(token)` → error / no user ⇒ **401** (fail-closed);
2. build a **user-scoped** Supabase client carrying that same verified token
   (`createClient(url, publishableKey, { global: { headers: { Authorization: "Bearer <token>" } },
auth: { persistSession: false } })`);
3. call `userClient.rpc('is_admin')`. PostgREST populates `request.jwt.claims` from the **verified**
   token, and `is_admin()` (SECURITY DEFINER, `20261023120000:72-84`, owner `postgres`) compares
   `lower(email)` to `public.admin_emails`; the `authenticated` role already has `EXECUTE`
   (`:89`), so **the guard needs no service-role key**;
4. **deny (fail-closed)** when the RPC returns `false`, `null`, errors, or verification is not
   possible (⇒ 401/403/503). Missing/invalid Supabase config ⇒ deny, never allow.

Routes to convert: `flush-cache`, `outreach-schedule` (GET/PUT), `outreach-planner-zones` (GET/PUT),
`outreach-notifications/test`, and the own-app revalidation action (§11).
`/api/cron/outreach-windows` keeps `CRON_SECRET` (machine caller, not a user) — unchanged. RLS stays
an **independent** second enforcement layer.

**Service-role key — scoped, demonstrated needs only (not a general authorization dependency):**
confined to specific data operations the browser roles cannot perform, configured only for the app
that does that work, and **never used by `requireDbAdmin`** nor sent to a browser:

- Website cache verification (`runPublicRevalidation` → `fetchPublishedProjects`) — **Website only**.
- Outreach `site_settings` schedule/planner writes and the `outreach_window_*` service_role-only
  tables on the cron path — **Workspace only**, and only those writes. Whether the `site_settings`
  write still needs the key depends on the **live** `site_settings` policy (Appendix A); if
  `authenticated` can write it under RLS, drop the service-role there as well.

### 10.3 DB-authoritative rollout with shadow verification (no permanent DB-OR-env)

The **database is always authoritative**; the legacy env gate is never an access grant once the
DB-only gate is enabled. **Live write policies are now verified in §13.1/§13.4** — `testimonials`,
`projects`, `site_settings`, `resume`, `page_views` and storage all already gate writes on
`is_admin()` (some also `OR admin_allowlist`; see §13.8 B5). The remaining lockout risk is **not** an
over-broad RLS policy but that the intended admin identity is currently **absent from
`public.admin_emails`** (§13.8 B1): flipping to a DB-only app gate before that is fixed could lock out
a signed-in editor. Staged plan (owner-verified at each step; **no production action taken by this
migration**):

1. **Read-only verify** (Appendix A.1): the intended admin identity is present in
   `public.admin_emails` (compare normalized lowercase only; never print values). If absent, the
   owner adds it (additive) **before** any enforcement change.
2. **Shadow phase (code, non-authoritative env):** the guard decides with `rpc('is_admin')`; in
   parallel it computes the legacy env result and **logs only a divergence counter** (DB-allow vs
   env-allow mismatch counts — never an email/secret). The two gates are compared; env grants
   nothing.
3. **Reconcile** until divergence is zero (every real admin resolves via the DB).
4. **Enable DB-only fail-closed (code):** delete the env branch entirely — env no longer
   participates in any decision. Fail-closed on missing config, RPC error, or `false`.
5. **Dual-authority reconciliation (owner decision — no automatic policy change):** live writes
   already require `is_admin()` (§13.1), so **no testimonials/projects RLS tightening is proposed.**
   The open item is the **coexistence** of `admin_emails` (email) and `admin_allowlist` (uid) as admin
   sources on `resume` and `documents` (§13.8 B5). Any consolidation is a deliberate owner production
   step; the repository migration for testimonials/`projects` stays **unreconciled** by design (the
   repo-vs-live distinction is preserved, not auto-synced).

**Rollback (never weakens DB auth):** revert the guard to the shadow phase (DB stays authoritative;
env observation re-enabled for logging only) via git revert/redeploy — do **not** re-widen RLS or
restore env as a granting source.

**Note (repo vs live):** the live policies for `projects`, `site_settings`, `resume`, `page_views`
and storage **have now been verified** (§13.1, §13.4) even though they are **not defined in any
repository migration** — that repo/live divergence is preserved, **not** auto-reconciled. No
RLS-tightening is needed (live writes already require `is_admin()`); the genuinely unresolved item is
the `admin_allowlist` dual-authority (§13.8 B5), a deliberate owner production decision, not part of
the source restructure.

### 10.4 Authorization test matrix (add to Phase 5)

Deterministic unit/integration where fixtures allow; mark live Supabase checks `NOT RUN` without
credentials. Cover: authorized admin (in `admin_emails`) ⇒ allow via `rpc('is_admin')`;
authenticated but non-allowlisted ⇒ deny (403) at guard AND RLS; unauthenticated ⇒ 401;
`is_admin()` RPC returns `false`/`null`/throws ⇒ deny (fail-closed); Supabase config missing/invalid
⇒ deny; a forged/browser-supplied email is ignored (decision comes from verified JWT claims);
network/verification failure ⇒ deny + retryable error (not "authorized", not "signed out"); direct
PostgREST/REST by a non-allowlisted user ⇒ RLS denies; each privileged route rejects missing or
low-privilege bearer; shadow divergence counter is exercised (DB-allow vs env-allow mismatch).

### 10.5 Exact `testimonials` policy (repo-verified, `20260914120000_testimonials_table.sql`)

| Policy                              | Table                 | Command | Roles (`TO`)          | USING  | WITH CHECK |
| ----------------------------------- | --------------------- | ------- | --------------------- | ------ | ---------- |
| `testimonials_select_public`        | `public.testimonials` | SELECT  | `anon, authenticated` | `true` | —          |
| `testimonials_insert_authenticated` | `public.testimonials` | INSERT  | `authenticated`       | —      | `true`     |
| `testimonials_update_authenticated` | `public.testimonials` | UPDATE  | `authenticated`       | `true` | `true`     |
| `testimonials_delete_authenticated` | `public.testimonials` | DELETE  | `authenticated`       | `true` | —          |

Table grants (same migration): `GRANT SELECT ON public.testimonials TO anon, authenticated;` and
`GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;`; `ALTER TABLE ... ENABLE
ROW LEVEL SECURITY`.

**What the repo establishes:** combined with those GRANTs, every `authenticated` request passes
INSERT/UPDATE/DELETE because the USING/WITH CHECK expressions are literal `true` — so the migration
as written does **not** restrict testimonials writes to the admin allowlist. **What it does NOT
prove:** that the **live** database still matches (a dashboard change could have diverged) — confirm
via Appendix A before acting. Treat this as a **pre-existing security finding**: it is **not**
silently changed during directory moves; any tightening is the owner's deliberate RLS step
(§10.3 step 5).

### 10.6 Service-role usage after this migration

`requireDbAdmin` uses **no** service-role key (§10.2). The key remains only for the scoped Website
and Workspace data operations listed in §10.2 and is validated as still necessary once the live
`site_settings` policy is known (Appendix A). Do not distribute it to Admin or across apps to
implement a common auth guard.

---

## 11. Website cache revalidation — Option A topology

**Ownership:** the **Website** deployment owns `/api/revalidate` and the Redis/Next cache infra
(`runPublicRevalidation`, `redisPublicCache`). Admin & Workspace never flush a relative `/api/...`
(that would hit their own origin).

**Actual Website contract today (VERIFIED, `src/app/api/revalidate/route.ts`):** `POST`, header
`x-revalidate-token`, matched against `[REVALIDATE_SECRET, NEXT_PUBLIC_REVALIDATE_SECRET,
NEXT_PUBLIC_ANALYTICS_INGEST_SECRET, VITE_ANALYTICS_INGEST_SECRET]`; JSON body `{ tags? }`.

**New server-side flow (design):**

```text
browser (Admin/Workspace) content mutation succeeds
   → same-app authenticated action endpoint  POST /api/_revalidate  (own origin)
       1. requireDbAdmin(request)            // §10.2 — verify the caller before revalidating
       2. read server-only WEBSITE_URL + REVALIDATE_SECRET
       3. validate WEBSITE_URL against a fixed allowlist (must be the canonical https website
          origin) — user input NEVER selects the destination (SSRF / open-redirect guard)
       4. server→server fetch(`${WEBSITE_URL}/api/revalidate`, POST,
            headers { x-revalidate-token: REVALIDATE_SECRET, content-type: application/json },
            body { tags }, AbortSignal.timeout(ms))
       5. 2xx → {ok:true}; non-2xx/timeout → {ok:false, revalidationFailed:true}
   → UI reports "saved, cache refresh pending" and can retry; the mutation is NOT rolled back
```

**Secret/env placement (server-only, never `NEXT_PUBLIC_`, never in a browser bundle):**

- `REVALIDATE_SECRET` → **Website** (verifier) + **Admin** + **Workspace** (senders).
- `WEBSITE_URL` → **Admin** + **Workspace** only (server-only; defaults to
  `https://www.sahinpro.me`, validated). Distinct from the outreach `SITE_URL` used for email links
  so the two concerns don't couple.

**Failure/timeout/invalid-config handling:** missing `WEBSITE_URL`/`REVALIDATE_SECRET` ⇒ structured
503 + clear log (no secret values); upstream non-2xx/timeout ⇒ surfaced to the caller as a retryable
revalidation failure while the DB write stands (best-effort flush, never blocks the save — mirrors
current `plannerCloudSync` best-effort style).

**Existing callers keep working during transition:** the Website's own code paths
(`publicDataCache.flushServerCache` → `/api/admin/flush-cache` then `/api/revalidate`) remain on the
Website origin untouched. Admin/Workspace switch from the shared `publicDataCache` write-flush to the
new own-app action endpoint only after §10.4-style tests pass; until then both paths exist.
`publicDataCache` is therefore **split**: read helpers stay shared; the write-flush becomes
website-targeted per app (§2.1).

### 11.1 B3 — pre-existing secret-in-browser, deprecation plan (separate, deliberate)

`NEXT_PUBLIC_REVALIDATE_SECRET` and `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET` are browser-bundled and
currently _accepted as valid tokens_. This is pre-existing (not introduced here) and **not silently
broken** by the split. Hardening is a separate, tested change: (1) provision dedicated server-only
`REVALIDATE_SECRET`/`ANALYTICS_INGEST_SECRET`; (2) confirm all real callers use them; (3) remove the
`NEXT_PUBLIC_*`/`VITE_*` entries from the accepted list in the routes; (4) rotate the exposed values.
Each step gated by tests; not part of Phase 2.

---

## 12. Corrected environment-ownership map (server-only secrets, per app)

| Secret/Var                                                              | Server-only | Website          | Admin                               | Workspace                            | Notes                                              |
| ----------------------------------------------------------------------- | ----------- | ---------------- | ----------------------------------- | ------------------------------------ | -------------------------------------------------- |
| `SUPABASE_SERVICE_ROLE_KEY`                                             | ✅          | –                | (authz §10 + settings if tightened) | ✅ (leads/outreach authz + schedule) | never browser                                      |
| `CRON_SECRET`                                                           | ✅          | –                | –                                   | ✅                                   | cron endpoint lives in Workspace (post-cutover)    |
| `REVALIDATE_SECRET`                                                     | ✅          | ✅ (verifier)    | ✅ (sender)                         | ✅ (sender)                          | §11                                                |
| `WEBSITE_URL` (new, server-only)                                        | ✅          | –                | ✅                                  | ✅                                   | validated revalidation target; §11                 |
| `ANALYTICS_INGEST_SECRET`                                               | ✅          | ✅ (verifier)    | –                                   | –                                    | pageview ingest                                    |
| `RESEND_API_KEY`                                                        | ✅          | ✅ (contact)     | –                                   | ✅ (outreach)                        |                                                    |
| `TURNSTILE_SECRET_KEY`                                                  | ✅          | ✅               | –                                   | –                                    |                                                    |
| `UPSTASH_REDIS_REST_URL/TOKEN`                                          | ✅          | ✅ (cache infra) | –                                   | –                                    |                                                    |
| `OUTREACH_NOTIFICATION_ZONES`                                           | ✅          | –                | –                                   | ✅                                   |                                                    |
| `SITE_URL` (canonical/email links)                                      | ✅          | ✅               | –                                   | ✅                                   | email-link host; verify post-split (audit §6 note) |
| `NEXT_PUBLIC_SUPABASE_URL` + pub/anon key                               | client      | ✅               | ✅                                  | ✅                                   | required by all three                              |
| `NEXT_PUBLIC_ADMIN_*` (display/avatar/quota)                            | client      | –                | ✅                                  | ✅                                   | display-only after §10; **not** an access grant    |
| `NEXT_PUBLIC_REVALIDATE_SECRET` / `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET` | client ⚠    | legacy           | –                                   | –                                    | **B3** — slated for removal, §11.1                 |

`NEXT_PUBLIC_ADMIN_EMAIL` is retained only as an optional display hint; per B1 it no longer grants
access once §10.3 step 3 lands.

---

## 13. Live-verification register (owner-run read-only Supabase audit)

Owner completed additional SELECT-only verification against the live project. Categories are kept
strictly separate. **No observation below is asserted as an exploitable vulnerability unless an
actual reachable path is demonstrated** — none is. No `admin_emails`/`admin_allowlist` rows, grants,
policies, storage, or cron were changed by this work.

### 13.1 VERIFIED — live RLS policy state (owner SQL)

RLS is **enabled** on all inspected application tables; `relforcerowsecurity = false` on all.

| Table           | Live policy (VERIFIED)                               | Repo comparison                                         |
| --------------- | ---------------------------------------------------- | ------------------------------------------------------- |
| `leads`         | admin-only CRUD via `is_admin()`                     | matches repo                                            |
| `projects`      | published public SELECT + admin ALL                  | matches repo-comment intent                             |
| `site_settings` | public SELECT + admin ALL                            | repo has no migration — live-only                       |
| `page_views`    | admin SELECT only                                    | writes are NOT browser (see §13.5)                      |
| `resume`        | admin policy = `is_admin()` **OR** `admin_allowlist` | repo has no migration — live-only                       |
| `testimonials`  | public SELECT + **`is_admin()`-restricted writes**   | **DIVERGES** from repo migration (`authenticated:true`) |

**Repository/live divergence (testimonials):** `20260914120000` writes are `authenticated` with
`USING/WITH CHECK = true`, but the **live** DB restricts writes to `is_admin()`. Someone tightened
it in the dashboard after the migration. **Recorded, not silently reconciled.** Audit §10.5 describes
the migration; this section is the authoritative live state. (Practical effect: live testimonials
writes are already allowlist-gated — but via `is_admin()`, which reads `admin_emails`, see blocker.)

### 13.2 VERIFIED — `is_admin()` function & grants

`public.is_admin()` owner = `postgres`; `authenticated` EXECUTE = **true**; `anon` EXECUTE = **true**.
The approved `rpc('is_admin')`-in-JWT guard design (§10.2) is supported by the live DB.

### 13.3 VERIFIED — effective table privileges (`has_table_privilege`) — SECURITY OBSERVATION

Broad `SELECT/INSERT/UPDATE/DELETE/TRUNCATE = true` for **anon + authenticated + service_role** on:
`admin_allowlist`, `page_views`, `projects`, `resume`, `site_settings`, `testimonials`. `leads`:
anon false, authenticated/service_role true. `admin_emails`: service_role only (correct).

Interpretation (do not overstate):

- **GRANTs and RLS are separate layers.** Normal row DML still requires an RLS policy to pass, and
  §13.1 shows those policies are restrictive. Broad table grants alone do **not** prove an exploitable
  REST path — PostgREST routes through RLS and does not expose `TRUNCATE`.
- **`TRUNCATE` is NOT protected by RLS.** `anon`/`authenticated` holding `TRUNCATE` on those tables is
  a real risk surface **only if** a reachable callable executes it. Repository investigation (§13.5) found
  **no migration-defined** RPC or `SECURITY DEFINER` function that truncates or writes these tables, and
  the **public-schema** inventory (§13.6) lists only `is_admin()` and `set_updated_at()` as executable by
  anon/authenticated. **Function bodies were not inspected**, and a **database-wide** inventory remains
  UNVERIFIED (§13.7), so we do **not** claim these functions cannot `TRUNCATE`. **Status: an exploitable
  TRUNCATE path is NOT DEMONSTRATED (neither confirmed nor ruled out).** Supabase may apply broad default
  grants; the observed state is recorded **without** assuming it was intentional or is directly
  exploitable. No grant was revoked/modified.
- **Classification:** OWNER REVIEW REQUIRED (potential over-broad default grants; needs a
  database-wide function-inventory check before any conclusion). **Not asserted exploitable.** Phase 2
  remains paused regardless (owner approval — see §13.8).

### 13.4 VERIFIED — storage buckets & policies

Buckets: `documents` (public = **true**, 3 objects), `portfolio-assets` (public = **true**, 48
objects); both `file_size_limit = null`, `allowed_mime_types = null`.
Policies: `documents` — public SELECT; INSERT/UPDATE/DELETE require `is_admin()` **OR**
`admin_allowlist`. `portfolio-assets` — public SELECT; INSERT/UPDATE/DELETE require `is_admin()`.

**Public-bucket exposure model:** a **public** Supabase Storage bucket lets **anyone holding an
object's public URL** retrieve it **without any authorization header** — public-URL reachability is
not access control. Both buckets are `public = true`.

**OWNER REVIEW REQUIRED:** the intended use/contents of `documents` (3 public objects) are **unknown**,
and their **intended public visibility is unconfirmed**. Do **not** assume they are safe for public
access; contents were **not** inspected; visibility/policies were **not** changed.

### 13.5 VERIFIED — repository dependencies (read-only source inspection)

1. **`admin_allowlist` references (app code) — help/error text only, no data access:**
   `src/admin/lib/formatAdminError.ts:4` ("Add your user id to public.admin_allowlist (see
   supabase/README)") and `src/admin/pages/AdminDashboardPage.tsx:98`. The referenced `supabase/README`
   **does not exist** in the repo (dangling doc reference). ⇒ The application does **not** functionally
   read/write `admin_allowlist`; the **live DB** does (§13.1 `resume`, §13.4 `documents`).
2. **Bucket references:** `portfolio-assets` (media library) — `storageUpload.ts`, `listMediaFiles.ts:5,71`,
   `storageMetrics.ts:6`, `ImageGalleryField.tsx:29`, `ImageUrlField.tsx:22`, `AdminMediaLibraryPage.tsx:82`
   (`DEFAULT_UPLOAD_BUCKET`), `AdminProjectFormPage.tsx:482,533,656,672`, `AdminTestimonialFormPage.tsx:291`.
   `documents` (resume) — `src/lib/resumeStorage.ts:4` (`RESUME_STORAGE_BUCKET = "documents"`),
   `AdminResumePage.tsx:95,103,166`, `storageMetrics.ts:6`.
3. **`page_views` write path:** only the edge function `supabase/functions/record-page-view/index.ts:49`
   (`admin.from("page_views").insert(...)`). Browser usage is **read-only**:
   `src/admin/hooks/useDashboardData.ts:76`, `src/admin/pages/AdminAnalyticsPage.tsx:17`. The Website
   `POST /api/pageview` proxies to this edge function.
4. **Is `service_role` used for `page_views` writes? YES** — `record-page-view/index.ts:27-31` creates a
   client with `SUPABASE_SERVICE_ROLE_KEY`, bypassing RLS. Guard: `x-analytics-secret` header must equal
   env `ANALYTICS_INGEST_SECRET`; CORS `Access-Control-Allow-Origin: *` on the function. This reconciles
   the apparent conflict with §13.1 (`page_views` admin-SELECT RLS governs **reads**, writes never go
   through the browser).
5. **App RPCs that write:** none. Only `src/admin/lib/leads/leadRepository.ts:216` `supabase.rpc("is_admin")`
   (read-only boolean). All other writes are direct browser table calls (RLS-governed) or the service-role
   edge function above.
6. **SQL functions executing `TRUNCATE` / dynamic SQL:** no repo function performs `TRUNCATE`. Dynamic
   `execute format(...)` appears **only** in the pg_cron scheduling migrations
   (`20261023180000`, `20261028130000`) calling `cron.schedule/unschedule` — not truncation, not
   user-reachable (revoked from app roles).
7. **Functions exposed to anon/authenticated (evidenced from repository migrations only):**
   `public.is_admin()` (`SECURITY DEFINER`, owner `postgres`, returns boolean — **body/`search_path` not
   inspected here, so "safe" is NOT asserted**); `public.jwt_email()` (revoked from anon/authenticated in
   the migration); `extensions.outreach_cron_tick()` (revoked from anon/authenticated/service_role in the
   migration). The **migration source** contains no function that writes or truncates the §13.3 tables,
   but **live function bodies have not been inspected**, so "cannot truncate" is **not** established from
   this alone. Public-schema **executability** inventory is §13.6; `is_admin()` definition/`search_path`
   and a database-wide inventory remain UNVERIFIED (§13.7). An exploitable `TRUNCATE` path is **NOT
   DEMONSTRATED**.
8. **`is_admin()` / `admin_emails` references:** migrations `20261023120000`, `20261028120000`;
   `leadRepository.ts:11,46,92,216`; `LeadCloudSyncBanner.tsx:52` (help text). App uses `is_admin()` to
   gate the leads screen.
9. **Does the app depend on `admin_allowlist` for resume/documents?** Application **code**: no
   functional dependency (help/error text only). **Live DB policies**: yes — `resume` admin policy
   (`is_admin()` OR `admin_allowlist`) and `documents` storage CUD (`is_admin()` OR `admin_allowlist`).
   Retiring `admin_allowlist` would change **DB authorization outcomes** even though no app code path
   reads it. **Do not delete/modify/retire it.**

### 13.6 VERIFIED (partial) — public-schema function inventory (owner SQL)

Owner ran a read-only inventory restricted to the **public** schema, **ordinary** functions, and those
executable by `anon` or `authenticated`:

| Function           | Owner      | SECURITY DEFINER | anon EXECUTE | authenticated EXECUTE |
| ------------------ | ---------- | ---------------- | ------------ | --------------------- |
| `is_admin()`       | `postgres` | true             | true         | true                  |
| `set_updated_at()` | `postgres` | false            | true         | true                  |

Scope + honesty limits (do **NOT** overstate):

- This is a **public-schema inventory only** — **NOT** a complete database-wide function inventory
  (other schemas such as `extensions`, and non-ordinary functions, are out of scope here).
- The inventory establishes **which** public-schema functions anon/authenticated can **execute** — **not
  what their bodies do.** Function bodies were **not inspected**, so this does **not** prove that
  `is_admin()`/`set_updated_at()` cannot execute `TRUNCATE`/dynamic SQL or write the §13.3 tables. It means
  **no callable is yet DEMONSTRATED** to abuse the broad grants. Concluding safety requires inspecting the
  function definitions **and** a **database-wide** inventory (both §13.7 UNVERIFIED).
- Classification, kept separate: **public-schema function inventory = VERIFIED**; **`is_admin()` live
  definition/`search_path` = UNVERIFIED**; **`set_updated_at()` return type + trigger dependencies =
  UNVERIFIED**; **database-wide function inventory = UNVERIFIED**; **exploitable `TRUNCATE` path =
  NOT DEMONSTRATED**.
- **`set_updated_at()`**: return type and trigger dependencies are **UNVERIFIED**. It is very likely the
  conventional `BEFORE UPDATE` `updated_at` trigger helper (not a client RPC), but do **NOT** classify
  it as an RPC endpoint until its return type and trigger usage are confirmed.
- **`is_admin()`**: being `SECURITY DEFINER` and returning a boolean does **NOT** by itself make it
  safe. Its live definition, `proconfig`/`search_path` pinning and exact body remain **UNVERIFIED**
  unless independently inspected; only the repo migration (`20261023120000`) has been read.

### 13.7 UNVERIFIED / PARTIALLY VERIFIED

- **Cron (PARTIAL):** live job confirmed — `jobid 1`, `outreach-window-reminder-tick`, schedule
  `*/3 * * * *`, `active = true` (**VERIFIED**). The job's actual **execution target** (the Vault
  `outreach_cron_endpoint_url` value) is **UNVERIFIED** — Vault values were not queried (as instructed).
- **Function inventory (PARTIAL):** public-schema ordinary functions executable by anon/authenticated
  are inventoried (§13.6). A **database-wide** (all-schema) inventory, `set_updated_at()`'s return type
  - trigger bindings, and `is_admin()`'s live definition/`search_path` remain **UNVERIFIED**.
- **Admin identity (BLOCKER, see §13.8).**
- **Vercel project/domain attachments, Cloudflare proxy state** — unchanged UNKNOWN (dashboard-only).

### 13.8 BLOCKERS (must resolve before the corresponding step)

> **Architecture decision is RESOLVED.** The owner selected **Option B** — `public.admin_emails` +
> `public.is_admin()` as the intended authoritative admin source (§10.1 Goal). The items below are
> rollout **blockers/dependencies toward that chosen design**, **not** a reopening of the decision.

- **B1 — admin identity absent from `admin_emails` → BLOCKS the DB-only _rollout_ (not the design).**
  `public.admin_emails` contains **1 row** and `intended_admin_present = false`, so enabling a DB-only
  app gate today would lock the owner out. Do **not** modify `admin_emails`; do **not** switch app authz
  to DB-only yet (runbook Appendix B steps 1–4 on hold). This is a **data/onboarding** blocker, not an
  unresolved architectural choice.
- **B5 — `admin_allowlist` remains a separate unresolved dual-authority _dependency_.** A **second**,
  independent allowlist — `admin_allowlist` (schema `user_id UUID NOT NULL`, 2 rows, policy
  `admin_allowlist_select_own`, `user_id = auth.uid()`) — is an alternative admin source used by live
  `resume` RLS and `documents` storage policies. It coexists with `admin_emails` (email), against the
  single-source-of-truth goal. **Do not reveal `user_id` values; do not delete/modify
  `admin_allowlist`.** Requires an owner decision on consolidation before the fail-closed flip.
- **§13.3 broad grants — OWNER REVIEW REQUIRED (not asserted exploitable).** Concluding on the
  `TRUNCATE`-grant observation needs a **database-wide** function inventory (§13.6/§13.7). Treated as a
  separate remediation if confirmed, never silently changed.
- **B4 — browser lead IndexedDB** on `www.sahinpro.me` will not appear on `workspace.sahinpro.me`;
  export/import with counts still required (runbook §1.4/§5).

**Phase 2 status: PAUSED — explicit owner approval required to begin.** No physical source-tree moves
or Phase 2 implementation may begin until the owner explicitly approves. **Technical separability of a
blocker does not grant implementation permission.** Pending before approval: (a) admin identity present
in `admin_emails`, (b) resolution of the `admin_emails` vs `admin_allowlist` dual-authority (B5),
(c) a database-wide function inventory to conclude on the §13.3 grant observation, and (d) explicit
owner sign-off. No source moved; no DB/grant/policy/storage/cron/Vault/DNS/Vercel change; no commits or
pushes.
