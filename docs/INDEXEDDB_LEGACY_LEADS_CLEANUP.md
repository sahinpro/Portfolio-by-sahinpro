# Legacy Browser IndexedDB (`lead-crm-db`) — Unused by the CRM

> **Status: informational only.** There is nothing to run, clean up, or verify in the browser.
> This document used to describe a manual cleanup procedure; that procedure is obsolete and has
> been removed.

## Current architecture

**Supabase is the single source of truth for the Workspace CRM.**

- **Leads** live only in the Supabase `leads` table. Every read, create, update, delete, search,
  filter, pagination and dashboard statistic in `workspace.sahinpro.me` is served from that table
  through the RLS-protected client (`src/admin/lib/leads/leadRepository.ts`). Nothing is cached in
  a browser-local database.
- **Outreach Time Planner preferences** (zone picks, market filter, expanded state) are stored in
  the Supabase `site_settings` table under the keys `outreach_planner_zones` and
  `outreach_planner_prefs`, read/written through the admin-only
  `/api/admin/outreach-planner-zones` route.
- **Schedule config** already lived in `site_settings` (`outreach_schedule_config`) and is unchanged.

The Workspace application **never initialises, reads from, or writes to IndexedDB**. The code that
did (`leadDb.ts`, `leadCloudMigration.ts`, the "Upload N leads" banner, and the local-to-cloud
migration planner) has been removed. There is no localStorage or other browser-local replacement —
that was a deliberate constraint.

## What the old `lead-crm-db` is

Before the cloud cutover, the CRM stored leads in a browser database named `lead-crm-db`
(object stores `leads` and `lead_prefs`) under the **legacy origin**
`https://www.sahinpro.me` (the old `/admin/leads` screen). IndexedDB is origin-scoped, so those
records belong to that origin only and were never visible to `workspace.sahinpro.me`.

Any such copy:

- is **legacy, unused browser storage** — the application never touches it;
- **does not need to be cleared**. Deleting, emptying, or "cleaning up" it has zero effect on the
  CRM, and doing so (e.g. via "Clear site data") would wipe unrelated data for that origin, so it
  is explicitly **not recommended**;
- remains harmless indefinitely, or disappears on its own if the browser ever evicts it.

## Migrating historical leads (already done / whenever it happens)

The owner's exported JSON backup is imported **directly into Supabase** through the Workspace UI:

1. Workspace → Leads → **Import Backup** → select the `leads-backup-<date>.json` file.
2. The file is fully validated first (`parseBackup` rejects any invalid record — a validation
   failure imports nothing).
3. The Review dialog previews `added / updated / skipped` counts; choose **Merge safely** (never
   **Replace all** when preserving existing records matters). Merge writes only new or
   strictly-newer records, compared as parsed epoch timestamps — equal, newer, or uncomparable
   cloud records are preserved.
4. The chosen records are upserted straight into the Supabase `leads` table — no browser-local
   intermediate step exists anymore.

**Completion check before treating the migration as done:**

- Board total after import equals backup `count` minus the skipped (preserved) records;
- optionally cross-check in Supabase: `SELECT count(*) FROM public.leads;`;
- refresh the page, and open Workspace in a second browser/device — the same leads must appear,
  proving the data is cloud-backed rather than browser-local.

Keep the JSON export outside the repository (never commit it) until the counts are verified.
