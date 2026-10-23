"use client";

import {
  LeadSourceText,
  OutreachBadge,
  PriorityBadge,
  WebsiteBadge,
} from "@/admin/components/leads/LeadBadges";
import { LeadFilterBar } from "@/admin/components/leads/LeadFilterBar";
import { LeadSummaryCards } from "@/admin/components/leads/LeadSummaryCards";
import { AdminListPagination } from "@/admin/components/ui/AdminListPagination";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { useToast } from "@/admin/context/ToastContext";
import { useLeads } from "@/admin/hooks/useLeads";
import {
  exportLeadsCsv,
  exportLeadsJson,
  mergeLeadsById,
  parseBackup,
} from "@/admin/lib/leads/leadBackup";
import {
  addDaysIso,
  applyFilters,
  classifyFollowUp,
  computeSummary,
  EMPTY_FILTERS,
  getCountryFacets,
  getNicheFacets,
  hasActiveFilters,
  sortLeads,
  todayIso,
  type FollowUpBucket,
  type LeadFilterState,
  type LeadSortKey,
  type SortDir,
} from "@/admin/lib/leads/leadService";
import type { Lead } from "@/admin/types/lead";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import {
  ChevronDown,
  ChevronUp,
  Download,
  Eye,
  FileJson,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  Upload,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function locationLabel(lead: Lead): string {
  return [lead.city, lead.country].filter(Boolean).join(", ") || "—";
}

const FOLLOW_UP_STYLES: Record<FollowUpBucket, string> = {
  overdue: "text-red-300",
  today: "text-amber-200",
  upcoming: "text-white/50",
  none: "text-white/30",
};

function FollowUpCell({ lead }: { lead: Lead }): JSX.Element {
  const bucket = classifyFollowUp(lead.followUpDate);
  return (
    <div className="min-w-0">
      <span className={`block truncate text-sm ${FOLLOW_UP_STYLES[bucket]}`}>
        {lead.followUpDate ? formatDate(lead.followUpDate) : "No date"}
      </span>
      {lead.followUpDate && bucket !== "upcoming" ? (
        <span
          className={`text-[11px] font-medium capitalize ${FOLLOW_UP_STYLES[bucket]}`}
        >
          {bucket}
        </span>
      ) : null}
    </div>
  );
}

function SortHeader({
  label,
  columnKey,
  activeKey,
  dir,
  onSort,
  className,
}: {
  label: string;
  columnKey: LeadSortKey;
  activeKey: LeadSortKey;
  dir: SortDir;
  onSort: (key: LeadSortKey) => void;
  className?: string;
}): JSX.Element {
  const active = activeKey === columnKey;
  return (
    <button
      type="button"
      onClick={() => onSort(columnKey)}
      className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
        active ? "text-white/70" : "text-white/30 hover:text-white/50"
      } ${className ?? ""}`}
    >
      {label}
      {active ? (
        dir === "asc" ? (
          <ChevronUp className="h-3 w-3" />
        ) : (
          <ChevronDown className="h-3 w-3" />
        )
      ) : null}
    </button>
  );
}

function RowActions({
  lead,
  onLogFollowUp,
  onDelete,
}: {
  lead: Lead;
  onLogFollowUp: (lead: Lead) => void;
  onDelete: (id: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const itemClass =
    "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label={`Actions for ${lead.businessName}`}
          aria-expanded={open}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        collisionPadding={12}
        className="w-52 p-0 rounded-xl border border-white/[0.1] bg-zinc-950 text-white shadow-2xl shadow-black/60 z-[100]"
      >
        <div className="py-1">
          <Link
            href={`/admin/leads/${lead.id}`}
            className={`${itemClass} text-white/70 hover:bg-white/[0.05] hover:text-white`}
            onClick={() => setOpen(false)}
          >
            <Eye className="h-3.5 w-3.5" />
            View / edit details
          </Link>
          <button
            type="button"
            className={`${itemClass} text-white/70 hover:bg-white/[0.05] hover:text-white`}
            onClick={() => {
              onLogFollowUp(lead);
              setOpen(false);
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Log contact (+1 follow-up)
          </button>
          <div className="mx-2 my-1 h-px bg-white/[0.06]" />
          <button
            type="button"
            className={`${itemClass} text-red-400/90 hover:bg-red-500/10 hover:text-red-300`}
            onClick={() => {
              onDelete(lead.id);
              setOpen(false);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }): JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Users className="h-8 w-8 text-white/20" aria-hidden />
      <p className="mt-3 text-sm font-medium text-white/70">
        {hasFilters ? "No leads match your filters" : "No leads yet"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-white/40">
        {hasFilters
          ? "Try adjusting your search or filters, or clear them to see everything."
          : "Track the businesses you find on Google Maps, Instagram, and elsewhere. Add your first lead to get started."}
      </p>
      {!hasFilters ? (
        <Link
          href="/admin/leads/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Add Lead
        </Link>
      ) : null}
    </div>
  );
}

const desktopGrid =
  "grid-cols-[minmax(160px,1.4fr)_110px_minmax(130px,1fr)_140px_120px_150px_140px_96px_48px]";

type PendingImport = {
  leads: Lead[];
  added: number;
  updated: number;
  kept: number;
};

export function AdminLeadsListPage({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  const {
    leads,
    loading,
    error,
    reload,
    saveLead,
    removeLead,
    replaceAllLeads,
    mergeLeads,
  } = useLeads();

  const [filters, setFilters] = useState<LeadFilterState>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<LeadSortKey>("updatedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  // Reload from IndexedDB when returning to the list from the add/edit panel.
  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (
      prev !== null &&
      prev !== "/admin/leads" &&
      pathname === "/admin/leads"
    ) {
      void reload();
    }
  }, [pathname, reload]);

  useEffect(() => {
    setPage(1);
  }, [filters, sortKey, sortDir]);

  const nicheFacets = useMemo(() => getNicheFacets(leads), [leads]);
  const countryFacets = useMemo(() => getCountryFacets(leads), [leads]);
  const summary = useMemo(() => computeSummary(leads), [leads]);

  const filteredSorted = useMemo(
    () => sortLeads(applyFilters(leads, filters), sortKey, sortDir),
    [leads, filters, sortKey, sortDir],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSorted.length / LIST_PAGE_SIZE),
  );
  const safePage = Math.min(page, totalPages);
  const paginated = filteredSorted.slice(
    (safePage - 1) * LIST_PAGE_SIZE,
    safePage * LIST_PAGE_SIZE,
  );

  const active = hasActiveFilters(filters);

  const patchFilters = (patch: Partial<LeadFilterState>) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handleSort = (key: LeadSortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "businessName" ? "asc" : "desc");
    }
  };

  const handlePageChange = (next: number) => {
    setPage(next);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const logFollowUp = async (lead: Lead) => {
    const today = todayIso();
    try {
      await saveLead({
        ...lead,
        followUpCount: (lead.followUpCount ?? 0) + 1,
        lastContactDate: today,
        followUpDate: addDaysIso(7),
        updatedAt: new Date().toISOString(),
      });
      showToast(
        `Logged contact for ${lead.businessName} · next follow-up in 7 days`,
      );
    } catch {
      showToast("Could not update the local database", "error");
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const target = leads.find((l) => l.id === deleteId);
    setDeleteId(null);
    try {
      await removeLead(deleteId);
      showToast(target ? `Deleted ${target.businessName}` : "Lead deleted");
    } catch {
      showToast("Could not delete the lead", "error");
    }
  };

  const handleExportJson = () => {
    if (leads.length === 0) {
      showToast("No leads to export yet", "warning");
      return;
    }
    exportLeadsJson(leads);
    showToast(
      `Exported ${leads.length} lead${leads.length === 1 ? "" : "s"} to JSON`,
    );
  };

  const handleExportCsv = () => {
    if (leads.length === 0) {
      showToast("No leads to export yet", "warning");
      return;
    }
    exportLeadsCsv(leads);
    showToast(
      `Exported ${leads.length} lead${leads.length === 1 ? "" : "s"} to CSV`,
    );
  };

  const handleImportFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      const text = await file.text();
      const result = parseBackup(text);
      if (!result.ok) {
        showToast(result.message, "error");
        return;
      }
      const preview = mergeLeadsById(leads, result.leads);
      setPendingImport({
        leads: result.leads,
        added: preview.added,
        updated: preview.updated,
        kept: preview.keptExistingNewer,
      });
    } catch {
      showToast("Could not read that file", "error");
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const applyImport = async (mode: "merge" | "replace") => {
    if (!pendingImport) return;
    setBusy(true);
    try {
      if (mode === "replace") {
        await replaceAllLeads(pendingImport.leads);
        showToast(
          `Replaced all leads with ${pendingImport.leads.length} record(s)`,
        );
      } else {
        await mergeLeads(pendingImport.leads);
        showToast(
          `Merged backup · ${pendingImport.added} added, ${pendingImport.updated} updated`,
        );
      }
      setPendingImport(null);
    } catch {
      showToast("Could not write the imported leads to local storage", "error");
    } finally {
      setBusy(false);
    }
  };

  const toolButton =
    "inline-flex items-center gap-2 rounded-lg border border-white/[0.10] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-40";

  return (
    <div className="max-w-6xl space-y-6 xl:max-w-[96rem]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Leads
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            A private CRM for freelance outreach. Everything is stored only in
            this browser.
          </p>
          <p className="mt-1.5 max-w-2xl text-[11px] leading-relaxed text-white/30">
            These records live in your browser&rsquo;s local database
            (IndexedDB) and are never uploaded. They don&rsquo;t sync across
            devices and can be lost if you clear site data — use{" "}
            <strong>Export Backup</strong> regularly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void reload()}
            disabled={loading || busy}
            className={toolButton.replace("px-3 py-2 ", "") + " p-2"}
            aria-label="Refresh leads"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/leads/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add Lead
          </Link>
        </div>
      </div>

      <LeadSummaryCards
        summary={summary}
        filters={filters}
        onSelect={(patch) => patchFilters(patch)}
      />

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={handleExportJson} className={toolButton}>
          <FileJson className="h-4 w-4" />
          Export Backup (JSON)
        </button>
        <button type="button" onClick={handleExportCsv} className={toolButton}>
          <Download className="h-4 w-4" />
          Export CSV
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className={toolButton}
        >
          <Upload className="h-4 w-4" />
          Import Backup
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => void handleImportFile(e.target.files?.[0])}
        />
      </div>

      <LeadFilterBar
        filters={filters}
        onPatch={patchFilters}
        nicheFacets={nicheFacets}
        countryFacets={countryFacets}
        hasActive={active}
        onClear={() => setFilters(EMPTY_FILTERS)}
      />

      <div
        ref={listRef}
        className="min-w-0 scroll-mt-6 overflow-hidden rounded-xl border border-white/[0.08]"
      >
        {error ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <p className="text-sm font-medium text-red-300">
              Could not load your local leads
            </p>
            <p className="max-w-md text-xs text-white/40">{error}</p>
            <button
              type="button"
              onClick={() => void reload()}
              className={toolButton}
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : loading ? (
          <div>
            {Array.from({ length: LIST_PAGE_SIZE }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border-b border-white/[0.04] px-4 py-3.5 last:border-b-0"
              >
                <div className="h-4 w-1/3 rounded bg-white/10 md:hidden" />
                <div
                  className={`hidden gap-3 md:grid md:items-center ${desktopGrid}`}
                >
                  <div className="h-4 w-32 rounded bg-white/10" />
                  <div className="h-4 w-16 rounded bg-white/[0.06]" />
                  <div className="h-4 w-24 rounded bg-white/[0.06]" />
                  <div className="h-4 w-20 rounded bg-white/[0.06]" />
                  <div className="h-4 w-16 rounded bg-white/[0.06]" />
                  <div className="h-4 w-20 rounded bg-white/[0.06]" />
                  <div className="h-4 w-20 rounded bg-white/[0.06]" />
                  <div className="h-4 w-10 rounded bg-white/[0.06]" />
                  <div />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSorted.length === 0 ? (
          <EmptyState hasFilters={active} />
        ) : (
          <Fragment>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[1080px]">
                <div className="border-b border-white/[0.06] bg-white/[0.02]">
                  <div
                    className={`grid items-center gap-3 px-4 py-2.5 ${desktopGrid}`}
                  >
                    <SortHeader
                      label="Business"
                      columnKey="businessName"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Niche
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Location
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Website
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Source
                    </span>
                    <SortHeader
                      label="Outreach"
                      columnKey="outreachStatus"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Follow-up"
                      columnKey="followUpDate"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Priority"
                      columnKey="priority"
                      activeKey={sortKey}
                      dir={sortDir}
                      onSort={handleSort}
                    />
                    <span />
                  </div>
                </div>

                {paginated.map((lead) => (
                  <div
                    key={lead.id}
                    className="border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <div
                      className={`grid items-center gap-3 px-4 py-3 ${desktopGrid}`}
                    >
                      <div className="min-w-0">
                        <Link
                          href={`/admin/leads/${lead.id}`}
                          className="block truncate text-sm font-medium text-white/85 hover:text-white"
                        >
                          {lead.businessName || "Untitled"}
                        </Link>
                        {lead.contactPerson ? (
                          <p className="truncate text-xs text-white/40">
                            {lead.contactPerson}
                          </p>
                        ) : null}
                      </div>
                      <span className="truncate text-sm text-white/55">
                        {lead.niche || "—"}
                      </span>
                      <span className="truncate text-sm text-white/55">
                        {locationLabel(lead)}
                      </span>
                      <WebsiteBadge status={lead.websiteStatus} />
                      <span className="truncate text-sm text-white/55">
                        <LeadSourceText source={lead.leadSource} />
                      </span>
                      <OutreachBadge status={lead.outreachStatus} />
                      <FollowUpCell lead={lead} />
                      <PriorityBadge priority={lead.priority} />
                      <RowActions
                        lead={lead}
                        onLogFollowUp={(l) => void logFollowUp(l)}
                        onDelete={setDeleteId}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden">
              {paginated.map((lead) => (
                <div
                  key={lead.id}
                  className="border-b border-white/[0.04] px-4 py-3.5 last:border-b-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      className="min-w-0 text-sm font-medium text-white/85 hover:text-white"
                    >
                      <span className="block truncate">
                        {lead.businessName || "Untitled"}
                      </span>
                      <span className="block truncate text-xs text-white/40">
                        {[lead.niche, locationLabel(lead)]
                          .filter((v) => v && v !== "—")
                          .join(" · ")}
                      </span>
                    </Link>
                    <RowActions
                      lead={lead}
                      onLogFollowUp={(l) => void logFollowUp(l)}
                      onDelete={setDeleteId}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <OutreachBadge status={lead.outreachStatus} />
                    <WebsiteBadge status={lead.websiteStatus} />
                    <PriorityBadge priority={lead.priority} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-white/40">
                    <span className="flex items-center gap-1">
                      <Pencil className="h-3 w-3" />
                      <LeadSourceText source={lead.leadSource} />
                    </span>
                    <FollowUpCell lead={lead} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-4">
              <AdminListPagination
                page={safePage}
                totalItems={filteredSorted.length}
                onPageChange={handlePageChange}
                aria-label="Leads pagination"
              />
            </div>
          </Fragment>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this lead?"
        message="This permanently removes the lead from this browser's local storage. This cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />

      {pendingImport ? (
        <ImportDialog
          pending={pendingImport}
          existingTotal={leads.length}
          busy={busy}
          onCancel={() => setPendingImport(null)}
          onMerge={() => void applyImport("merge")}
          onReplace={() => void applyImport("replace")}
        />
      ) : null}

      {children}
    </div>
  );
}

function ImportDialog({
  pending,
  existingTotal,
  busy,
  onCancel,
  onMerge,
  onReplace,
}: {
  pending: PendingImport;
  existingTotal: number;
  busy: boolean;
  onCancel: () => void;
  onMerge: () => void;
  onReplace: () => void;
}): JSX.Element {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Cancel import"
        onClick={onCancel}
        disabled={busy}
      />
      <div
        className="relative w-full max-w-md rounded-xl border border-white/[0.1] bg-[#141414] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm import"
      >
        <h3 className="text-lg font-semibold text-white">Review backup</h3>
        <p className="mt-2 text-sm text-white/60">
          The backup contains{" "}
          <strong className="text-white">{pending.leads.length}</strong> valid
          lead(s). You currently have{" "}
          <strong className="text-white">{existingTotal}</strong> stored
          locally.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-white/50">
          <li>• {pending.added} new (would be added)</li>
          <li>• {pending.updated} would update an existing (newer) record</li>
          <li>• {pending.kept} skipped — your stored copy is newer</li>
        </ul>
        <p className="mt-3 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200/80">
          <strong>Merge</strong> keeps your current leads and only
          adds/refreshes records safely. <strong>Replace all</strong> deletes
          every current lead first — only choose this if you are restoring a
          full backup.
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onReplace}
            disabled={busy}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 disabled:opacity-50"
          >
            Replace all
          </button>
          <button
            type="button"
            onClick={onMerge}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:opacity-50"
          >
            {busy ? "Working…" : "Merge safely"}
          </button>
        </div>
      </div>
    </div>
  );
}
