"use client";

import { useToast } from "@/admin/context/ToastContext";
import {
  describeUpload,
  inspectLeadSync,
  uploadLocalLeads,
  type LeadSyncStatus,
  type LeadUploadReport,
} from "@/admin/lib/leads/leadCloudMigration";
import {
  LEAD_STORE_MESSAGES,
  LeadStoreError,
  type LeadAccessState,
} from "@/admin/lib/leads/leadRepository";
import type { Lead } from "@/admin/types/lead";
import {
  AlertTriangle,
  CloudUpload,
  Database,
  Loader2,
  ShieldAlert,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Bridge between the old browser-only CRM and the Supabase `leads` table.
 *
 * Two jobs:
 *   1. explain a cloud failure (table not created yet, email not on the
 *      allowlist, expired session, offline) instead of showing an empty list;
 *   2. offer a one-time upload of the leads that still only exist in this
 *      browser, then verify them by re-reading the table.
 *
 * It never deletes anything from IndexedDB — the local copy stays as the
 * backup until the admin clears it by hand.
 */

/** Access states that mean "the cloud is not usable yet, and that is fixable". */
const ACTIONABLE: LeadAccessState[] = [
  "unconfigured",
  "missing-table",
  "not-authorised",
  "signed-out",
];

const HINTS: Partial<Record<LeadAccessState, string>> = {
  "missing-table":
    "Supabase Dashboard → SQL Editor → run supabase/migrations/20261023120000_leads_table.sql, then refresh this page.",
  "not-authorised":
    "Then add the email you sign in with: INSERT INTO public.admin_emails (email) VALUES ('you@example.com');",
  "signed-out": "Sign out and back in from the admin panel to start a new session.",
  unconfigured:
    "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart the app.",
};

const TONE: Record<
  "problem" | "pending" | "done",
  { wrap: string; chip: string; title: string }
> = {
  problem: {
    wrap: "border-amber-500/25 bg-amber-500/[0.07]",
    chip: "border-amber-500/30 bg-amber-500/15 text-amber-300",
    title: "text-amber-100",
  },
  pending: {
    wrap: "border-sky-500/25 bg-sky-500/[0.07]",
    chip: "border-sky-500/30 bg-sky-500/15 text-sky-300",
    title: "text-sky-100",
  },
  done: {
    wrap: "border-emerald-500/25 bg-emerald-500/[0.07]",
    chip: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
    title: "text-emerald-100",
  },
};

const primaryBtn =
  "inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90 disabled:pointer-events-none disabled:opacity-40";
const ghostBtn =
  "inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40";

export function LeadCloudSyncBanner({
  access,
  cloudLeads,
  loading,
  onSynced,
}: {
  /** Last known cloud-read outcome for the current session. */
  access: LeadAccessState;
  /** Leads currently shown from Supabase (used to work out what is still local). */
  cloudLeads: Lead[];
  loading: boolean;
  /** Re-read the cloud table after an upload. */
  onSynced: () => Promise<void>;
}): JSX.Element | null {
  const { showToast } = useToast();
  const [status, setStatus] = useState<LeadSyncStatus | null>(null);
  const [inspectFailed, setInspectFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<LeadUploadReport | null>(null);
  const [hidden, setHidden] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // How many of this browser's leads are still missing from the cloud table?
  // Skipped while the list is still loading, so a half-read table cannot make
  // every local lead look unsynced.
  useEffect(() => {
    if (access !== "ok" || loading) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const next = await inspectLeadSync(cloudLeads);
        if (!cancelled) {
          setStatus(next);
          setInspectFailed(false);
        }
      } catch {
        // No IndexedDB (private mode / cleared) — nothing to offer, no error.
        if (!cancelled) {
          setStatus(null);
          setInspectFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [access, cloudLeads, loading]);

  const pending = status?.pendingIds.length ?? 0;
  const problem = ACTIONABLE.includes(access);
  const verified = report
    ? report.missingIds.length === 0 && report.mismatchedIds.length === 0
    : false;

  const upload = useCallback(async () => {
    setBusy(true);
    try {
      const next = await uploadLocalLeads();
      if (!mountedRef.current) return;
      setReport(next);
      if (next.missingIds.length === 0 && next.mismatchedIds.length === 0) {
        showToast(describeUpload(next));
        await onSynced();
      } else {
        showToast(describeUpload(next), "error");
      }
    } catch (e) {
      if (!mountedRef.current) return;
      showToast(
        e instanceof LeadStoreError ? e.message : "The upload failed. Try again.",
        "error",
      );
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }, [onSynced, showToast]);

  if (hidden) return null;
  // Cloud is fine, everything local is already in it, and nothing just uploaded.
  if (!problem && (loading || (pending === 0 && !report))) return null;

  const tone = TONE[problem ? "problem" : verified ? "done" : "pending"];
  const Icon = problem
    ? access === "not-authorised"
      ? ShieldAlert
      : AlertTriangle
    : verified
      ? Database
      : CloudUpload;

  return (
    <section
      aria-label="Lead storage status"
      className={`rounded-xl border p-3 ${tone.wrap}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <span
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${tone.chip}`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${tone.title}`}>
              {access === "missing-table"
                ? "The Supabase leads table is not set up yet"
                : access === "not-authorised"
                  ? "Your account is not authorised for leads"
                  : access === "signed-out"
                    ? "Your admin session expired"
                    : access === "unconfigured"
                      ? "Supabase is not configured for this deployment"
                      : verified
                        ? "Local leads copied to Supabase"
                        : `${pending} lead${pending === 1 ? "" : "s"} still only in this browser`}
            </p>

            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/55">
              {problem
                ? LEAD_STORE_MESSAGES[access]
                : report
                  ? describeUpload(report)
                  : `${pending} of your leads exist only in this browser. Upload copies them into the leads table and checks each one came back.`}
            </p>

            {problem && HINTS[access] ? (
              <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-white/40">
                {HINTS[access]}
              </p>
            ) : null}

            {problem && (status?.localCount ?? 0) > 0 ? (
              <p className="mt-1.5 text-[11px] text-white/40">
                {status?.localCount} lead{(status?.localCount ?? 0) === 1 ? "" : "s"}
                remain safe in this browser&rsquo;s local database — nothing has
                been removed.
              </p>
            ) : null}

            {report && !verified ? (
              <p className="mt-1.5 text-[11px] text-white/40">
                {report.missingIds.length} not found ·{" "}
                {report.mismatchedIds.length} different after the upload. Retry,
                or use <strong>Export Backup (JSON)</strong> and{" "}
                <strong>Import Backup</strong> instead.
              </p>
            ) : null}

            {inspectFailed && access === "ok" ? (
              <p className="mt-1.5 text-[11px] text-white/40">
                This browser&rsquo;s local lead store could not be opened, so
                there is nothing to compare against.
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {problem ? (
            <button type="button" onClick={() => setHidden(true)} className={ghostBtn}>
              <X className="h-4 w-4" />
              Hide
            </button>
          ) : pending > 0 && !verified ? (
            <>
              <button
                type="button"
                onClick={() => void upload()}
                disabled={busy}
                className={primaryBtn}
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CloudUpload className="h-4 w-4" />
                )}
                Upload {pending} lead{pending === 1 ? "" : "s"}
              </button>
              <button
                type="button"
                onClick={() => setHidden(true)}
                disabled={busy}
                className={ghostBtn}
              >
                Later
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setHidden(true)}
              className={ghostBtn}
            >
              <X className="h-4 w-4" />
              Dismiss
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 pl-[38px] text-[11px] leading-relaxed text-white/35">
        Upload copies your local leads into Supabase and checks every one came
        back. Your browser keeps its own copy — it is never deleted
        automatically.
      </p>
    </section>
  );
}
