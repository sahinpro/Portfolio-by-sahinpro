# Qoder IDE Agent Prompt — Safe Monorepo Migration

**Repository:** `sahinpro/Portfolio-by-sahinpro`  
**Package manager:** Bun (`bun@1.4.2` in the inspected `package.json`)  
**Framework:** Next.js App Router, Next.js 15 / React 18 / TypeScript  
**Architecture decision:** Approved monorepo with three separately deployable Next.js applications  
**Primary goal:** Keep the public website stable while separating the Lead CRM / Outreach Workspace from the existing website CMS Admin.

> **How to use this file:** Open the repository root in Qoder IDE, give the agent this file as its implementation brief, and ask it to follow the phases in order. This plan authorizes repository code/configuration work only. It does **not** authorize production deployment, Vercel domain reassignment, DNS/proxy changes, Supabase SQL execution, Vault changes, or deleting user data.

---

## 1. Your role and operating rules

Act as a **senior software architect and migration engineer**. Execute this migration conservatively, using repository evidence rather than assumptions. First understand the current application and the working tree; then design and implement the smallest safe change that produces the approved architecture.

### Non-negotiable “no-guess” rules

1. **Inspect before editing.** Read the existing source, configs, route tree, scripts, migrations, tests, Git status, current branch, and actual import/call relationships before deciding where a file belongs.
2. **Do not assume the checked-out working tree matches GitHub `main`.** Record the current commit/branch and uncommitted changes. Never overwrite or discard existing user work. Do not run `git reset --hard`, `git clean -fd`, or destructive cleanup commands.
3. **Separate facts, decisions, and unknowns.** In `docs/MONOREPO_MIGRATION_AUDIT.md`, label each important finding as `VERIFIED`, `DECISION`, or `BLOCKER/UNKNOWN`, and cite exact repository paths (and line numbers where practical). Do not write “probably” as if it were established fact.
4. **Search all call-sites before moving a route or module.** Trace imports, aliases, links, `fetch()` URLs, server-side URL construction, forms, route handlers, cron endpoint configuration, scripts, generated assets and environment variable reads. A directory name alone is not proof of ownership.
5. **Do not expose secrets.** Never print real environment values, tokens, service-role keys, Resend credentials or cron secrets in the report or terminal output. It is fine to report a variable name and whether it is configured.
6. **Preserve data.** Do not delete or migrate browser IndexedDB/localStorage records automatically. Do not run database migrations, modify live Supabase data, change RLS in production, or overwrite local lead data as part of this refactor.
7. **Do not weaken security to make a build pass.** Keep server-only variables server-only. Preserve and test the existing admin checks and Supabase RLS. Any inconsistent policy must be highlighted and resolved explicitly, not bypassed.
8. **No external production actions.** Do not deploy to Vercel, change Vercel project settings/domains/environment variables, alter Cloudflare DNS/proxy settings, edit Supabase Vault, or run Supabase SQL. Prepare a human-reviewed cutover runbook for those actions.
9. **Do not add infrastructure/tooling without evidence.** Use Bun workspaces first. Do not introduce Turborepo, a new database, another auth provider, or a new deployment platform unless a concrete requirement and build proof justify it.
10. **Do not perform a big-bang rewrite.** Move the existing implementation with behavior-preserving changes. Avoid redesigning UI, changing business rules, renaming database fields, or modernizing unrelated code.
11. **Do not claim a test passed unless you ran it.** Include exact commands and honest results. If the environment cannot run a check, record it as `NOT RUN` with the reason.
12. **Stop at genuine blockers.** Do all analysis that can be completed from the repo. If a decision requires unavailable production/dashboard state or might risk user data/security, do not guess: prepare a concrete blocker question and stop before the risky action. Continue independent safe work where possible.

## 2. Approved target architecture

Create a **Bun workspace monorepo** containing three independently buildable/deployable Next.js applications and only the shared packages justified by code inspection.

```text
Portfolio-by-sahinpro/
├── apps/
│   ├── website/       # Public portfolio and public-facing APIs
│   ├── workspace/     # Lead CRM and Outreach Planner
│   └── admin/         # Existing CMS/Admin Management
├── packages/
│   └── shared/        # Only genuinely shared, app-neutral code identified by audit
├── package.json       # Private Bun workspace root + orchestration scripts
├── bun.lock           # Single root lockfile; preserve and update reproducibly
├── README.md
└── docs/
    ├── MONOREPO_MIGRATION_AUDIT.md
    └── MONOREPO_CUTOVER_RUNBOOK.md
```

This is the target shape, **not permission to force every file into the proposed folders blindly**. Use the audited dependency graph to decide which modules belong in each app and what, if anything, belongs in `packages/shared`.

### Application ownership

**A. `apps/website` — `www.sahinpro.me`**

Own the public portfolio experience and its public behavior: public pages, metadata/SEO, sitemap/robots/llms assets, contact form, public content APIs, public page-view ingestion, public assets, and any cache/revalidation functionality that must execute against the website's deployment. Verify every route and caller before assigning ownership. Keep canonical public URLs stable.

**B. `apps/workspace` — `workspace.sahinpro.me`**

Own the Lead CRM and Outreach Planner: lead list/details/create/edit behavior, lead types, browser-to-cloud migration/verification flow, lead data access, outreach schedule UI and its APIs, notification-test behavior, and the single authoritative outreach cron endpoint after an explicit cutover. The workspace root should provide a clear entry into the Lead CRM. Select canonical path names after inspecting the real route tree and all links; provide compatibility redirects for legacy URLs where they are verified to have been used.

**C. `apps/admin` — `admin.sahinpro.me`**

Own the existing portfolio CMS/Admin Management: dashboard, projects, testimonials, media, analytics, website settings, resume/CV, and related CMS features. Preserve existing workflows and authorization. The domain root should lead to the CMS dashboard; preserve current `/admin/...` paths during the initial migration unless inspection proves a safe equivalent redirect strategy.

**D. `packages/shared`**

Only move code used by two or more apps when it is app-neutral and safe to share. Candidate categories to investigate: types, validation schemas, pure utilities, UI primitives, common environment parsing, or auth helper contracts. Do not move Next.js route handlers, route-specific UI, app-specific Supabase data access, secrets, or side-effectful server logic into `shared` merely to make the tree look tidy. If a module is shared but needs a major refactor, leave it in its original app for phase one and document the trade-off rather than introduce unnecessary risk.

### Deployment model

One Git repository, **three separate Vercel projects**, each linked to the same repository and configured with the appropriate app root directory. The shared root lockfile and any `packages/shared` source must be visible to each build. Verify the current Vercel monorepo guidance and each project's “Include source files outside of the Root Directory in the Build Step” setting in the cutover runbook; never assume the dashboard option is correct.

Do not create a single Next.js project with host-based UI switching as a substitute for the three deployments.

---

## 3. Verified starting facts to confirm against the checked-out tree

These facts were observed while inspecting the repository's `main` branch. Re-check them against the local checkout before implementation; the local working tree is authoritative for your work.

- Root `package.json` currently describes one Next.js app named `portfolio`, uses ES module configuration, pins `bun@1.4.2`, and defines the build as favicon generation + sitemap generation + Next.js build.
- The current root `tsconfig.json` uses `@/*` and several more specific aliases rooted at `./src/*`. Those aliases must be re-evaluated per app; do not leave an alias silently pointing at the wrong app after the move.
- The current root `vercel.json` contains security headers, static asset cache headers, legacy `sahin.pro.bd` redirects, and the `X-Robots-Tag` rule for `/admin/*`. Preserve the relevant behavior in the correct app config(s); do not blindly duplicate the entire root file into all three apps.
- The repository has a public App Router under `src/app` and CMS-related code under `src/admin`.
- Current admin-related routes include `/admin`, `/admin/login`, CMS paths, and lead-related routes under the protected admin route group. The exact complete route inventory must come from the checked-out tree.
- In the inspected `main` branch, `src/app/admin/(protected)/leads/page.tsx` currently returns `null`, even though `src/admin/pages/AdminLeadsListPage.tsx` exists. **Do not assume the Lead CRM route is currently mounted or working.** Trace `AdminShell`, navigation, imports, dynamic rendering and route files to find the real composition path and report the discrepancy.
- Lead cloud migration code exists at `src/admin/lib/leads/leadCloudMigration.ts`; the lead table migration is `supabase/migrations/20261023120000_leads_table.sql`. The migration comments describe browser-local IndexedDB leads being uploaded and then independently verified against Supabase, with the browser copy left untouched.
- Supabase lead access is controlled by the `public.admin_emails` table, `public.is_admin()`, and RLS policies in the leads migration. Preserve those semantics and do not apply SQL as part of this work.
- `src/admin/lib/authHelpers.ts` treats `NEXT_PUBLIC_ADMIN_EMAIL` as optional and permits any user with an email when it is unset. `api/_lib/adminRouteAuth.ts` has a similar optional-env behavior. The database migration separately uses `public.admin_emails`. This is a security-sensitive policy boundary: inspect all checks and document it; do not silently relax or silently redesign it during the split.
- `src/app/api/admin/outreach-schedule/route.ts` uses a server-side `SUPABASE_SERVICE_ROLE_KEY` for schedule settings and uses the shared admin request authorization helper. That key must remain server-only.
- `src/app/api/cron/outreach-windows/route.ts` uses `CRON_SECRET` and `api/_lib/outreach/runOutreachNotifications`.
- The Supabase migration `supabase/migrations/20261023180000_supabase_cron_outreach_windows.sql` documents a database `pg_cron` job that reads `outreach_cron_endpoint_url` and `outreach_cron_secret` from Vault and invokes the cron endpoint. Its example URL is `https://www.sahinpro.me/api/cron/outreach-windows`. Moving the endpoint therefore requires a controlled manual Vault URL cutover and must keep exactly one authoritative target.
- Existing lead records may exist in browser-local storage. IndexedDB/localStorage is scoped to the browser origin, so data from `www.sahinpro.me` must not be assumed to appear automatically at `workspace.sahinpro.me`.
- Existing deployment / DNS details reported by the site owner are historical configuration, not live dashboard proof. Verify current Vercel domain attachments and Cloudflare records manually before the final cutover.

### Evidence references

Use these paths as entry points, then follow their dependencies rather than limiting the audit to them:

```text
package.json
bun.lock
next.config.ts
vercel.json
tsconfig.json
src/app/
src/admin/
src/admin/components/AdminShell.tsx
src/admin/components/AdminProtectedLayout.tsx
src/admin/lib/authHelpers.ts
src/admin/lib/requireAdminRequest.ts
src/admin/lib/leads/leadCloudMigration.ts
src/admin/lib/leads/leadRepository.ts
src/admin/hooks/useLeads.ts
src/admin/pages/AdminLeadsListPage.tsx
src/admin/types/lead.ts
api/_lib/adminRouteAuth.ts
api/_lib/cronAuth.ts
api/_lib/outreach/
src/app/api/admin/
src/app/api/cron/outreach-windows/route.ts
src/utils/supabase.ts
src/lib/env.ts
supabase/migrations/20261023120000_leads_table.sql
supabase/migrations/20261023180000_supabase_cron_outreach_windows.sql
supabase/migrations/20261023210000_outreach_reminder_claims.sql
```

The list is not exhaustive. Use `rg`/IDE search and build a full inventory.

---

## 4. Phase 0 — protect the current work and establish a baseline (read-only)

Before editing:

1. Run and record:
   - `git status --short --branch`
   - `git rev-parse HEAD`
   - `git log -1 --oneline`
   - `bun --version`
   - `node --version` (if available)
2. Record any uncommitted or untracked files. Do not stage, overwrite, discard, or reformat unrelated user edits. If the working tree is dirty, keep a file-by-file list of pre-existing changes.
3. Inventory all repository files and route handlers. Include app pages, route groups, API routes, middleware, `next.config.*`, `vercel.json`, scripts, Supabase functions/migrations, static files and lockfiles.
4. Read every `package.json`, TypeScript/ESLint/Tailwind/PostCSS config and build script in the current repo.
5. Establish baseline checks using the commands actually present in `package.json`:
   - `bun install --frozen-lockfile` (only if safe and lockfile format/tool version support it; do not delete or regenerate the lockfile as a “fix”)
   - `bun run type-check`
   - `bun run lint`
   - `bun test api/_lib/outreach/windowScheduler.test.ts api/_lib/outreach/zonesConfig.test.ts` or the existing `bun run test:outreach`
   - `bun run check:vercel-api`
   - `bun run build`
6. If a baseline check fails before your changes, record the exact failure. Do not misattribute pre-existing failures to the migration and do not weaken checks to hide them.
7. Create `docs/MONOREPO_MIGRATION_AUDIT.md` before restructuring. It must include the date, local commit, dirty-tree note, source inventory, route inventory, environment-variable inventory (names only), route-call graph, cross-app import graph, current tests/build results, risks, unknowns and intended app ownership.

### Phase 0 deliverable: a migration map

At minimum provide tables with:

- **Route map:** current method/path → current file → consumer(s) → target app → new path if changed → compatibility/redirect → auth requirement → test.
- **API map:** method/path → file → browser/server callers → variables/secrets read → target app → CORS/origin requirement → auth/rate-limit requirement.
- **Module map:** file/module → importers → app-specific/shared → target destination → reason.
- **Environment map:** variable name → read location → client-visible or server-only → which app requires it → required/optional as observed in code/docs. Never include actual values.
- **Data map:** public CMS data, leads table, `site_settings` schedule config, browser IndexedDB and any storage buckets/cache. State what is persisted where and whether a migration is needed.

**Phase 0 gate:** Do not physically move source directories until the migration map is complete enough to identify all consumers and the exact route ownership. Continue with safe investigation without asking the owner about details available in code.

## 5. Phase 1 — dependency and route ownership decisions

### 5.1 Route and navigation tracing

Trace the routes from `src/app/**/page.*` and `route.*`, plus all `Link`, `router.push/replace`, forms, hard-coded URLs, `fetch`, and `window.location` calls. Identify how `AdminShell` selects or mounts pages and whether the leads route's current `null` page means the CRM is inaccessible, rendered elsewhere, or intentionally a placeholder. Report the exact evidence.

Classify every route into one of these buckets:

1. public site;
2. CMS Admin;
3. Lead CRM / Outreach Workspace;
4. cross-app integration endpoint;
5. unclassified — keep blocked until traced.

Do not discard routes simply because they are undocumented. Preserve contact, resume, public-content, cache/revalidation, analytics and legacy host behavior by tracing actual usage.

### 5.2 Cross-origin contract

Because the apps will use separate origins, determine each frontend's dependency on relative `/api/...` URLs. Relative paths will call the app's own host after the split, which may be a behavior change. For every cross-app API call:

- Prefer keeping the API next to the feature that owns it.
- Where another app needs an endpoint, use an explicit, validated server-side/public base URL setting appropriate to that endpoint.
- Add narrowly scoped CORS only if browser JavaScript truly needs cross-origin access. Do not enable wildcard CORS for authenticated endpoints.
- Do not send service-role keys or other server secrets to browsers.
- Ensure admin mutations that revalidate the public site's cache call the **website deployment** intentionally, with correct server-side auth and secrets. Do not assume `/api/revalidate` on the admin host is the website revalidation endpoint.
- Check absolute links generated in notification emails and the configured canonical `SITE_URL`.

### 5.3 Auth and RLS compatibility

Build an authorization matrix for browser routes, API routes and Supabase tables. Specifically compare:

- `src/admin/lib/authHelpers.ts`;
- `src/admin/lib/requireAdminRequest.ts`;
- `api/_lib/adminRouteAuth.ts`;
- any other route guards found;
- RLS policies and `public.admin_emails` for leads;
- auth redirect destinations hard-coded as `/admin/login`.

The split must preserve least privilege. Admin and Workspace may have separate frontend login screens, but their authorization policy must be understood and consistent with the existing design. Any existing inconsistency must be documented and tested. If deciding the correct allowlist source cannot be proven from code/config, stop before changing authorization semantics and ask the owner a focused question. Do not “solve” auth by bypassing RLS or using a service-role key in the browser.

Supabase browser auth storage is origin-specific. Confirm whether the UX expects separate sign-in per subdomain; do not promise shared login sessions. Do not implement SSO/cookie sharing unless explicitly requested and designed safely.

### 5.4 Lead browser-data risk

Follow the complete IndexedDB implementation, database name/schema/version, export/import functions, `leadCloudMigration.ts`, fingerprint/duplicate logic and “upload local leads” UI. Determine which origins the existing UI can run on and whether the current local records could reside on `www.sahinpro.me` or `workspace.sahinpro.me`.

Preserve the current safety property that local records are not deleted by an upload. Require an independent Supabase read-back / matching check and clear counts for local, uploaded, verified, missing and mismatched records. If route behavior changes or the origin changes, provide explicit export-before-cutover / import-or-upload instructions. Never infer that zero local leads exist just because the agent cannot inspect a user's browser.

### 5.5 Cron ownership decision

Trace `api/_lib/outreach/**`, the endpoint auth, notification claims/deduplication, the relevant SQL migrations and all code/tests that depend on the production URL.

Desired end state: **one authoritative outreach cron endpoint in the Workspace deployment** because the feature belongs to Workspace. However:

- Do not update the Supabase Vault URL in code or automatically.
- Confirm that notification deduplication and the existing `outreach_window_notifications` uniqueness guarantees remain intact.
- Keep the current endpoint and Vault URL untouched until Workspace has a verified production domain and smoke checks.
- The cutover runbook must state the exact old and proposed endpoint URL, the exact Vault secret name, the manual update operation, how to check the job/response without leaking secrets, and rollback steps.
- Do not schedule a second cron job. Do not run notification sends against real users during testing; use existing test facilities or a controlled no-send path.

---

## 6. Phase 2 — establish Bun workspaces and move apps incrementally

Use Bun workspaces and one root lockfile unless the audit proves a concrete blocker. Do not add a task runner without necessity.

### 6.1 Root workspace setup

- Make the root package manifest private and declare workspace paths for `apps/*` and `packages/*`.
- Retain the existing package manager pin (`bun@1.4.2`) unless a demonstrated compatibility issue requires a documented update. Do not upgrade Next.js/React/TypeScript as part of this task.
- Keep a single root `bun.lock`; update it with Bun and verify frozen install after manifests settle.
- Add clear root scripts to run the per-app build, lint, type-check and relevant tests. Prefer Bun's workspace filters or explicit workspace commands; ensure failures propagate and return non-zero status.
- Each workspace app/package must have a unique `name` and must explicitly declare dependencies it imports. Avoid relying on accidental root `node_modules` hoisting.
- Keep dependencies local to the apps/packages that actually use them. Do not copy the full dependency list into all apps just because it is easiest. Shared versions can be aligned intentionally after analysis.

### 6.2 Move the existing app to `apps/website`

Make the public website build independently first, preserving its current routing, rendering, assets, SEO metadata, dynamic content, caching and contact flow. Keep the existing app's relative internal directory structure initially where possible; minimize import path churn.

Move/relocate the public site's `next.config.ts`, `tsconfig.json`, Tailwind/PostCSS/ESLint configurations, `public/` assets, favicon/sitemap scripts and website `vercel.json` in a way supported by Next.js/Vercel. Check build-time paths in scripts and generated-file destinations after moving them. The website app must not depend on importing from `apps/admin/src` or `apps/workspace/src`.

Do not copy host-specific redirects and `/admin` noindex rules blindly into all applications. Each app should ship only the headers/redirects that make sense for it; the website must retain required public SEO and legacy-host behavior. Ensure admin and workspace are `noindex`.

### 6.3 Move the Lead CRM / Outreach Workspace

Move only the verified lead-specific routes, UI, hooks, type/schema definitions, repository functions, IndexedDB migration/export/verification logic and outreach planner APIs to `apps/workspace`. Keep public site/CMS modules out of Workspace unless an explicit shared dependency is identified.

Make Workspace's root lead into the intended CRM landing page. Choose canonical route paths based on the Phase 0 route map; preserve legacy paths with explicit redirects/aliases as required. Do not allow the public site to accidentally keep rendering the CRM at the old URL after the separation.

Retain existing lead schema fields and IDs; do not change the SQL schema or normalize IDs in this architecture migration. Keep all lead CRUD protected by both application authorization and the existing Supabase RLS policy. Ensure unauthenticated and non-allowlisted users cannot view or mutate leads.

The `outreach-schedule`, planner-zone, notification-test and cron route assignments must follow the audited call graph. When moved, fix frontend API URLs deliberately and keep the cron endpoint server runtime/dynamic behavior and bearer-secret checks.

### 6.4 Move CMS Admin

Move the verified CMS route tree, `src/admin` pages/components/context/hooks/schemas and only the APIs they own into `apps/admin`. Preserve CMS functionality (projects, testimonials, media, settings, resume/CV and analytics) and its existing authorization flow. Keep `admin.sahinpro.me/` as a usable entrypoint to the dashboard; maintain the existing `/admin/...` paths where practical in phase one.

Find every cache flush/revalidation interaction. If CMS writes to Supabase and must invalidate website caches, make that connection explicit and secure. Avoid an unplanned rewrite of content APIs, storage paths, database schema or settings keys.

### 6.5 Shared package extraction

Only after both consumer apps can build, extract the smallest common pieces into `packages/shared` (or another explicitly named package if the audit supports it). Keep the API narrow and documented with `exports`. Ensure every consumer declares a `workspace:*` dependency.

For TypeScript/TSX shared package code, configure Next.js transpilation/build as needed; verify the current supported `transpilePackages` behavior against the installed Next.js version and all three apps. Shared code must not import from an app-specific `@/` alias or depend on one app's environment. If code sharing introduces circular dependencies or deployment friction, prefer a small intentional duplication of a pure helper over a brittle cross-app dependency, and document why.

### 6.6 Import aliases and static files

For each app, update `tsconfig.json` aliases to point to that app's own source tree. Remove ambiguous alias overlap that can resolve `@/admin/*` to a different app. Ensure Next.js generated type paths remain app-local and exclude app output directories appropriately.

Use an explicit asset ownership map. Public-site fonts/images/sitemap/robots are website-owned unless another app genuinely needs them. Put an asset in each app or a shared package only after checking licensing, path references and deployment behavior; don't rely on one Vercel app serving another app's `public/` files.

---

## 7. Phase 3 — URL, redirect and domain compatibility

Do not change DNS in this phase. Implement and test code-level routing/redirect behavior locally and on preview deployments.

### Desired domains

| Domain | App | Expected root behavior |
|---|---|---|
| `www.sahinpro.me` | Website | Public portfolio homepage |
| `sahinpro.me` | Website project | Preserve the existing permanent redirect to `https://www.sahinpro.me/` |
| `workspace.sahinpro.me` | Workspace | Open the Lead CRM entrypoint |
| `admin.sahinpro.me` | CMS Admin | Open the CMS dashboard entrypoint |

Preserve existing redirects for `sahin.pro.bd` / `www.sahin.pro.bd` to the canonical public site. Confirm current deployed alias behavior from the Vercel dashboard; the old `vercel.json` contains path-preserving redirects for those legacy hosts.

### Compatibility requirements

- Add explicit, tested redirects for verified legacy public-host paths that used to be served by the monolith. Lead routes must land on Workspace; CMS routes must land on Admin. Prevent redirect loops.
- Preserve query strings when redirecting auth callbacks, record IDs, pagination or filters; verify framework behavior and configure explicitly if necessary.
- Do not blanket redirect every `/admin/*` path to the same app without first distinguishing CRM routes from CMS routes.
- Ensure authentication `from` / callback URLs are encoded, validated and remain within an allowed same-app path. Avoid open redirect vulnerabilities when moving login routes.
- Ensure canonical URLs, contact links, resume links, email links, sitemap/robots and analytics endpoint calls use the intended host.
- Do not rely on Cloudflare path routing to split a single origin; the intended arrangement is separate Vercel projects with their respective custom domains.

---

## 8. Phase 4 — environment-variable and secret assignment

Produce an `.env.example` per app (or another clearly documented scheme) containing **names and safe placeholders only**. A root reference document may summarize which app needs what. Never copy real production values into the repo.

Audit all references before assigning variables. At minimum inspect these known names and discover any others with repository search:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`
- `NEXT_PUBLIC_ADMIN_DISPLAY_NAME`
- `NEXT_PUBLIC_ADMIN_AVATAR_URL`
- `NEXT_PUBLIC_SUPABASE_STORAGE_QUOTA_GB`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `RESEND_API_KEY` (server-only)
- `CONTACT_NOTIFICATION_TO_EMAIL`
- `CONTACT_NOTIFICATION_FROM_EMAIL`
- `RESEND_CONTACT_TEMPLATE_ID`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY` (server-only)
- `CONTACT_RATE_LIMIT_PER_MINUTE`
- `CONTACT_RATE_LIMIT_WINDOW_MS`
- `NEXT_PUBLIC_ANALYTICS_INGEST_SECRET`
- `ANALYTICS_INGEST_SECRET`
- `NEXT_PUBLIC_REVALIDATE_SECRET`
- `REVALIDATE_SECRET` (server-only)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN` (server-only)
- `CRON_SECRET` (server-only)
- `OUTREACH_NOTIFICATION_ZONES`
- `SITE_URL`
- `NEXT_PUBLIC_SITE_URL`

Do not infer that every app needs every variable. Make a table showing the actual readers. Where a browser variable currently contains the word `SECRET`, inspect the exact usage and security impact before retaining the existing name; do not expose a truly secret credential. Any security-sensitive variable rename or policy change must have a compatibility plan and tests.

For Vercel, use separate environment-variable configurations for each app so a secret is available only to the app that needs it. Shared public Supabase URL/key values may exist in more than one app if the audited clients need them. The service-role key, Resend key and cron secret must never be prefixed `NEXT_PUBLIC_` or bundled in a client module.

---

## 9. Phase 5 — automated verification and functional test matrix

Do not consider the split complete because the folders exist or TypeScript compiles. Create or adapt tests that demonstrate each app is independently buildable and the important behavior remains intact.

### Build/package checks

- `bun install --frozen-lockfile`
- website production build
- Workspace production build
- Admin production build
- each app type-check and lint
- existing outreach tests (run the current official script)
- Vercel API function count check for the app(s) where applicable; verify the existing function limit assumption against current configuration, do not delete endpoints to satisfy a counter without tracing usage
- check for unresolved imports and app-to-app source imports that bypass workspace package boundaries
- check that no unintended secrets or `.env*` files were added to Git
- verify each Vercel project can build from its configured root while including the required workspace sources

Root orchestration scripts should run the intended checks per app, fail fast where appropriate, and never silently skip a package.

### Public website smoke tests

- `/`, `/about`, `/projects`, project detail, `/services`, `/contact`
- public content loads when Supabase is configured; expected fallback behavior when configuration is absent
- contact submission/validation and any rate limiting/Turnstile behavior without sending repeated real emails during tests
- public content APIs and page-view ingestion
- SEO metadata, sitemap, robots, llms, favicons/fonts/images
- canonical host and old-host permanent redirects
- website cache revalidation with its secret protected

### CMS Admin smoke tests

- dashboard root/entrypoint
- login, logout, session-validation error/retry behavior and unauthorized redirects
- projects CRUD, testimonials CRUD, media, settings, resume/CV and analytics, to the extent test fixtures/environment allow
- CMS mutations still affect the intended Supabase data/storage
- cache flush/revalidation targets the website correctly
- admin pages are `noindex`; sensitive data and APIs are protected

### Workspace smoke tests

- Workspace root directs to CRM
- lead list, details, create/edit/delete (use non-production test records only)
- filtering/search/follow-up and all current outreach status interactions found in the code
- browser IndexedDB initialization/version upgrade, JSON export/import, legacy records with non-UUID IDs, duplicate handling and cloud migration verification
- upload with a deliberately mismatched/missing test record reports the discrepancy and never deletes the local copy
- authenticated allowlisted user can perform intended lead actions
- unauthenticated/non-allowlisted user cannot read or mutate leads through UI or direct API/REST calls; verify Supabase RLS remains effective
- schedule GET/PUT, timezone/zone config and notification test API; no production notification send during validation
- cron endpoint rejects missing/wrong bearer secret, reports missing env clearly and is dynamic/node runtime as required
- workspace cannot reach CMS-only pages or routes; CMS Admin cannot accidentally mount CRM-only navigation/pages

### Cross-origin and redirect tests

Test the intended full host/path matrix, including:

- website root/canonical host;
- workspace root and canonical CRM routes;
- admin root and CMS paths;
- old `www.sahinpro.me/admin/leads...` to Workspace;
- old `www.sahinpro.me/admin/...` CMS routes to Admin without swallowing lead routes;
- legacy `.pro.bd` redirects;
- unauthenticated deep links and login redirects;
- valid query-string preservation;
- redirect loop prevention;
- expected CORS behavior, if any;
- absolute URLs in notifications and cache invalidation.

If production credentials are unavailable, run deterministic unit/integration tests and locally verifiable smoke tests, then mark live Supabase/Vercel tests `NOT RUN`. Do not fabricate successful results.

---

## 10. Phase 6 — cutover runbook (manual and reversible)

Create `docs/MONOREPO_CUTOVER_RUNBOOK.md`. It must separate the code migration from actions that require dashboard access. Include exact checklists and the verification needed at each step.

### Pre-cutover

1. Confirm clean code review and all local/CI checks pass.
2. Confirm existing production deployment still works; capture the current Vercel project IDs/domain assignment and DNS state from current dashboards. Do not rely on old screenshots alone.
3. Deploy each app to a **preview** deployment and test routes, auth, APIs, cross-origin calls and static assets.
4. Confirm production env vars are assigned to the proper Vercel projects without exposing values.
5. Export any browser-local leads from the origin where the existing CRM data is stored. Record export counts and keep the backup outside the repository. Do not commit exports.
6. Confirm Supabase `admin_emails`, leads RLS/policies, and the existing cron job/unique dedupe records are unchanged. Read only; do not run migrations.

### Domain cutover sequence

Document the exact Vercel UI steps, but do not perform them:

1. Create/confirm separate Vercel projects linked to this repository and set each app's Root Directory (`apps/website`, `apps/workspace`, `apps/admin`).
2. Verify shared files are included in the build and the root Bun lockfile is discovered. Run a fresh deployment from the configured project root.
3. Attach `www.sahinpro.me` and `sahinpro.me` only to Website; attach `workspace.sahinpro.me` only to Workspace; attach `admin.sahinpro.me` only to Admin. Domain detach/attach order must avoid a broken production window; derive the exact safe order from current Vercel state.
4. Do not change Cloudflare DNS/proxying without the owner reviewing the current target and Vercel's requested record. Existing proxy settings have been reported as enabled; verify current state and proxy recommendations before touching them.
5. Verify TLS, canonical redirects, route coverage and authorization for every host.
6. Keep the existing public site deployment recoverable during the validation window.

### Supabase Vault cron cutover

The inspected migration's example target is:

- **Existing URL:** `https://www.sahinpro.me/api/cron/outreach-windows`
- **Intended target after Workspace is live:** `https://workspace.sahinpro.me/api/cron/outreach-windows`
- **Vault secret name:** `outreach_cron_endpoint_url`
- The bearer value is held separately in `outreach_cron_secret`; never print or rotate it as part of this move.

Only after Workspace's production domain is verified, update the existing Vault URL through the owner's approved Supabase process. Do not create a second cron job. Confirm the named `outreach-window-reminder-tick` job still has one intended schedule, endpoint auth succeeds, and dedupe prevents duplicate notifications. Check logs/status without exposing bearer headers or secret values. Provide a rollback instruction to restore the previous URL if Workspace fails; do not automatically execute rollback against production.

### Post-cutover acceptance

- Public website is unchanged in visible behavior and canonical SEO.
- Workspace is accessible at its assigned hostname and no longer renders the public portfolio instead of the CRM.
- Admin is accessible at its assigned hostname and CMS features continue working.
- Lead data has verified counts; browser-local copies remain available until owner confirms cloud verification and backup.
- Auth/RLS deny unauthorized access.
- Only one cron job/endpoint is authoritative; no duplicate notifications.
- Email/contact form, revalidation, page-view analytics, cache, resume/storage and all cross-origin integrations pass smoke checks.
- Record final deployed commit SHAs, Vercel project/domain mapping, verification time and unresolved issues. Never place secret values in this record.

### Rollback

Provide a reversible rollback sequence that can be performed manually:

- restore prior Vercel domain bindings to the existing known-good deployment;
- restore the old Vault endpoint URL if cron cutover occurred;
- leave the Supabase schema and lead rows untouched;
- do not delete new deployments or local lead backups until the system is stable;
- preserve audit logs and note the reason for rollback.

Avoid a rollback procedure that requires `git reset --hard` or destroys user changes. Prefer reverting the migration commit or redeploying a known-good commit after reviewing the diff.

---

## 11. Definition of done

The task is complete only when all applicable items are true:

- [ ] The audit document separates verified facts, decisions and unknowns.
- [ ] One root Bun workspace with one committed lockfile exists; the three app workspaces have unique names and explicit dependencies.
- [ ] `apps/website`, `apps/workspace`, and `apps/admin` build independently from their correct roots.
- [ ] Each app owns the correct routes/APIs/assets and has no accidental dependency on another app's `@/` alias or private source directory.
- [ ] The Lead CRM's real route mounting is understood and the intended CRM entrypoint works in Workspace.
- [ ] Existing public and CMS functionality is retained; legacy routes/hosts have tested redirects.
- [ ] Authz/RLS behavior is preserved, and the admin allowlist discrepancy is explicitly resolved or documented as a blocking decision rather than ignored.
- [ ] Local browser lead data export/upload/verification remains safe and non-destructive.
- [ ] Outreach scheduler has one authoritative target and a manual, reversible Vault cutover plan.
- [ ] No production DNS, Vercel domain, Supabase data/schema, or Vault change was performed by the agent.
- [ ] Tests/builds have honest results and pre-existing failures are distinguished from migration regressions.
- [ ] `docs/MONOREPO_CUTOVER_RUNBOOK.md` contains exact manual deployment/domain/cron/rollback steps.
- [ ] Final response reports files changed, architecture boundaries, exact test commands/results, blockers, manual owner actions, and any risks. Do not claim production is cut over unless the owner actually did it and verification evidence exists.

---

## 12. Required final report from the Qoder agent

When work stops or finishes, return a concise report with these headings:

1. **What changed** — list added/moved/edited files and explain important design choices.
2. **Architecture** — app route/API ownership and actual shared package boundaries.
3. **Verification** — every command run, result, and any `NOT RUN` check.
4. **Security/data safeguards** — auth/RLS, secrets, IndexedDB/cloud migration and cron dedupe findings.
5. **Manual cutover actions** — Vercel projects/domains, Cloudflare (if needed), environment variables and Vault URL, with no secrets.
6. **Blockers / owner decisions** — only genuine items not resolvable from source evidence.
7. **Rollback** — point to the tested/documented manual rollback procedure.

Do not end with “everything is done” if any build, auth, data migration, custom-domain, or cron item remains unverified.

---

## 13. Reference documentation

Use current official docs when validating implementation details; documentation supports the approach but does not replace inspecting this repository:

- Bun workspaces: https://bun.com/docs/pm/workspaces
- Bun lockfile: https://bun.com/docs/pm/lockfile
- Vercel monorepos: https://vercel.com/docs/monorepos
- Vercel monorepo FAQ (including shared source outside root directory): https://vercel.com/docs/monorepos/monorepo-faq
- Vercel build configuration/root directory: https://vercel.com/docs/builds/configure-a-build
- Next.js `transpilePackages`: https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages
- Repository: https://github.com/sahinpro/Portfolio-by-sahinpro
