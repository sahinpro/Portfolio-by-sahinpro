"use client";

import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import type { ProjectRow } from "@/admin/types/database";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import {
  ExternalLink,
  FolderKanban,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import { Fragment, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminListPagination } from "@/admin/components/ui/AdminListPagination";
import { LIST_PAGE_SIZE } from "@/lib/pagination";

type Filter = "all" | "published" | "draft" | "trash";
type DeleteDialogState = { id: string; permanent: boolean } | null;
type BulkAction = "none" | "draft" | "published" | "trash";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProjectRowActions({
  row,
  onMoveToTrash,
  onRestoreDraft,
  onPermanentDelete,
}: {
  row: ProjectRow;
  onMoveToTrash: (id: string) => void;
  onRestoreDraft: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);
  const isTrash = row.status === "trash";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label={`More actions for ${row.title}`}
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
        className="w-48 p-0 rounded-xl border border-white/[0.1] bg-zinc-950 text-white shadow-2xl shadow-black/60 z-[100]"
      >
        <div className="py-1">
          <Link
            href={`/admin/projects/${row.id}`}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-3.5 w-3.5" />
            {isTrash ? "View / edit" : "Edit project"}
          </Link>
          {row.status === "published" ? (
            <a
              href="/projects"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View on site
            </a>
          ) : null}
          <div className="mx-2 my-1 h-px bg-white/[0.06]" />
          {isTrash ? (
            <>
              <button
                type="button"
                onClick={() => {
                  onRestoreDraft(row.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-emerald-300/90 transition-colors hover:bg-emerald-500/10"
              >
                <Undo2 className="h-3.5 w-3.5" />
                Restore to draft
              </button>
              <button
                type="button"
                onClick={() => {
                  onPermanentDelete(row.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete permanently
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                onMoveToTrash(row.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Move to trash
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EmptyState({ search, filter }: { search: string; filter: Filter }) {
  const message =
    search || filter !== "all"
      ? "No projects match your search."
      : "No projects yet.";
  const hint =
    search || filter !== "all"
      ? "Try adjusting your filters."
      : "Create a project to add it to your portfolio.";

  return (
    <div className="flex flex-col items-center gap-3 py-16 px-4">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07]
        bg-white/[0.04] text-white/20"
      >
        <FolderKanban className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/60">{message}</p>
        <p className="mt-0.5 text-xs text-white/30">{hint}</p>
      </div>
      {filter === "trash" ? (
        <p className="text-xs text-white/25">
          Deleted projects appear here until removed permanently.
        </p>
      ) : null}
      {!(search || filter !== "all") ? (
        <Link
          href="/admin/projects/new"
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      ) : null}
    </div>
  );
}

/** Checkbox, cover, title, category, status, updated, featured, actions */
const projectsGridCols =
  "md:grid-cols-[40px_72px_1fr_108px_88px_112px_72px_44px] lg:grid-cols-[40px_88px_1fr_128px_96px_128px_80px_44px]";

export function AdminProjectsListPage({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);
  const [bulkAction, setBulkAction] = useState<BulkAction>("none");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((data ?? []) as ProjectRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (
      prev !== null &&
      prev !== "/admin/projects" &&
      pathname === "/admin/projects"
    ) {
      void load();
    }
  }, [pathname, load]);

  useEffect(() => {
    setSelectedIds([]);
    setBulkAction("none");
    setPage(1);
  }, [filter, search]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        if (filter === "all" && r.status === "trash") return false;
        if (filter !== "all" && r.status !== filter) return false;
        if (!search.trim()) return true;
        const q = search.trim().toLowerCase();
        const desc = (r.description ?? "").toLowerCase();
        const cat = (r.category ?? "").toLowerCase();
        return (
          r.title.toLowerCase().includes(q) ||
          desc.includes(q) ||
          cat.includes(q)
        );
      }),
    [rows, filter, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (page - 1) * LIST_PAGE_SIZE;
    return filtered.slice(start, start + LIST_PAGE_SIZE);
  }, [filtered, page]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredIds = filtered.map((row) => row.id);
  const allFilteredSelected =
    filteredIds.length > 0 &&
    filteredIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected = filteredIds.some((id) =>
    selectedIds.includes(id),
  );

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((value) => value !== id),
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredIds : []);
  };

  const bulkUpdateStatus = async (status: ProjectRow["status"]) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .in("id", selectedIds);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    setRows((prev) =>
      prev.map((row) =>
        selectedIds.includes(row.id) ? { ...row, status } : row,
      ),
    );
    if (status === "trash") {
      showToast(
        `${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} moved to trash`,
        "error",
        "They are hidden from the public site until restored.",
      );
    } else {
      showToast(
        `${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} updated`,
      );
    }
    setSelectedIds([]);
  };

  const applyBulkAction = async () => {
    if (bulkAction === "none") {
      showToast("Choose a bulk action", "error");
      return;
    }
    await bulkUpdateStatus(bulkAction);
    setBulkAction("none");
  };

  const toggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase
      .from("projects")
      .update({ featured })
      .eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));
  };

  const restoreDraft = async (id: string) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "draft" })
      .eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "draft" } : r)),
    );
    setSelectedIds((prev) => prev.filter((value) => value !== id));
    showToast("Project restored to draft");
  };

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    const { id, permanent } = deleteDialog;
    const query = permanent
      ? supabase.from("projects").delete().eq("id", id)
      : supabase.from("projects").update({ status: "trash" }).eq("id", id);
    const { error } = await query;
    setDeleteDialog(null);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    if (permanent) {
      showToast(
        "Project deleted permanently",
        "error",
        "This cannot be undone.",
      );
      setRows((prev) => prev.filter((row) => row.id !== id));
    } else {
      showToast(
        "Project moved to trash",
        "error",
        "Hidden from the public site. Restore anytime from Trash.",
      );
      setRows((prev) =>
        prev.map((row) => (row.id === id ? { ...row, status: "trash" } : row)),
      );
    }
    setSelectedIds((prev) => prev.filter((value) => value !== id));
  };

  const counts = {
    all: rows.filter((row) => row.status !== "trash").length,
    published: rows.filter((row) => row.status === "published").length,
    draft: rows.filter((row) => row.status === "draft").length,
    trash: rows.filter((row) => row.status === "trash").length,
  };

  return (
    <div className="max-w-6xl space-y-6 xl:max-w-[90rem]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Projects
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            Manage portfolio case studies. Published projects appear on the
            public site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-white/[0.10] bg-white/[0.03] p-2 text-white/50 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            aria-label="Refresh list"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            New project
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select
            value={bulkAction}
            onValueChange={(value) => setBulkAction(value as BulkAction)}
          >
            <SelectTrigger className="h-9 w-full border-white/10 bg-white/[0.04] text-white sm:w-[190px]">
              <SelectValue placeholder="Bulk actions" />
            </SelectTrigger>
            <SelectContent className="border-white/10 bg-[#111] text-white">
              <SelectItem value="none" className="focus:bg-white/10">
                Bulk actions
              </SelectItem>
              <SelectItem value="draft" className="focus:bg-white/10">
                Move to draft
              </SelectItem>
              <SelectItem value="published" className="focus:bg-white/10">
                Publish
              </SelectItem>
              <SelectItem value="trash" className="focus:bg-white/10">
                Move to trash
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            className="border-white/10 bg-white/[0.04] text-white hover:bg-white/[0.08]"
            onClick={() => void applyBulkAction()}
            disabled={selectedIds.length === 0}
          >
            Apply
          </Button>
          <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
            {(["all", "published", "draft", "trash"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
                  filter === value
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {value}
                <span
                  className={`tabular-nums text-[11px] ${filter === value ? "text-white/60" : "text-white/25"}`}
                >
                  {counts[value]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
            <Input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="w-full rounded-lg border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]"
            />
          </div>
          <p className="text-sm text-white/55">
            {selectedIds.length > 0
              ? `${selectedIds.length} selected`
              : "Select one or more projects"}
          </p>
        </div>
      </div>

      <div
        ref={listRef}
        className="min-w-0 scroll-mt-6 overflow-hidden rounded-xl border border-white/[0.08]"
      >
        <div className="hidden border-b border-white/[0.06] bg-white/[0.02] md:block">
          <div className={`grid gap-0 px-4 py-2.5 md:grid ${projectsGridCols}`}>
            <span className="flex items-center">
              <Checkbox
                checked={
                  allFilteredSelected ||
                  (someFilteredSelected ? "indeterminate" : false)
                }
                onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                aria-label="Select all projects"
              />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Cover
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Title
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Category
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Status
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Updated
            </span>
            <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Featured
            </span>
            <span />
          </div>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: LIST_PAGE_SIZE }).map((_, index) => (
              <Fragment key={index}>
                <div className="border-b border-white/[0.04] px-4 py-3.5 last:border-b-0 md:hidden">
                  <div className="animate-pulse">
                    <div className="flex gap-3">
                      <div className="mt-1 h-4 w-4 rounded bg-white/[0.06]" />
                      <div className="h-14 w-14 shrink-0 rounded-lg bg-white/10" />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="h-4 w-3/4 max-w-[12rem] rounded bg-white/10" />
                        <div className="h-3 w-1/2 max-w-[8rem] rounded bg-white/[0.06]" />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <div className="h-3 w-20 rounded bg-white/[0.06]" />
                          <div className="h-3 w-12 rounded bg-white/[0.06]" />
                          <div className="h-5 w-14 rounded-md bg-white/[0.06]" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`hidden animate-pulse border-b border-white/[0.04] px-4 py-3.5 last:border-b-0 md:grid md:items-center ${projectsGridCols}`}
                >
                  <div className="h-4 w-4 self-center rounded bg-white/[0.06]" />
                  <div className="h-14 w-14 rounded-lg bg-white/10" />
                  <div>
                    <div className="mb-1.5 h-4 w-48 rounded bg-white/10" />
                    <div className="h-3 w-32 rounded bg-white/[0.06]" />
                  </div>
                  <div className="h-4 w-20 self-center rounded bg-white/[0.06]" />
                  <div className="h-5 w-16 self-center rounded-md bg-white/[0.06]" />
                  <div className="h-4 w-24 self-center rounded bg-white/[0.06]" />
                  <div className="mx-auto h-4 w-10 self-center rounded bg-white/[0.06]" />
                  <div />
                </div>
              </Fragment>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          <div>
            {paginated.map((row) => (
              <div
                key={row.id}
                className={`group border-b border-white/[0.04] last:border-b-0 transition-colors ${
                  selectedIds.includes(row.id)
                    ? "bg-white/[0.04]"
                    : "hover:bg-white/[0.025]"
                } ${row.status === "trash" ? "opacity-75" : ""}`}
              >
                <div className="px-4 py-3.5 md:hidden">
                  <div className="flex gap-3">
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(checked) =>
                          toggleSelect(row.id, checked === true)
                        }
                        aria-label={`Select ${row.title}`}
                      />
                    </div>
                    <div className="flex shrink-0 items-start">
                      <img
                        src={
                          row.image_url?.trim()
                            ? row.image_url
                            : PROJECT_IMAGE_PLACEHOLDER
                        }
                        alt=""
                        className="h-14 w-14 rounded-lg border border-white/[0.08] bg-black/30 object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/admin/projects/${row.id}`}
                          className="line-clamp-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
                        >
                          {row.title}
                        </Link>
                        <ProjectRowActions
                          row={row}
                          onMoveToTrash={(id) =>
                            setDeleteDialog({ id, permanent: false })
                          }
                          onRestoreDraft={(id) => void restoreDraft(id)}
                          onPermanentDelete={(id) =>
                            setDeleteDialog({ id, permanent: true })
                          }
                        />
                      </div>
                      {row.description?.trim() ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
                          {row.description.trim()}
                        </p>
                      ) : null}
                      <span className="mt-1 block truncate text-[11px] text-white/28">
                        {row.category}
                      </span>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/40">
                        <span className="tabular-nums">
                          {formatDate(row.updated_at)}
                        </span>
                        <StatusBadge status={row.status} />
                        <span className="inline-flex items-center gap-1.5 text-white/45">
                          Featured
                          <ToggleSwitch
                            checked={row.featured}
                            disabled={row.status === "trash"}
                            onChange={(v) => void toggleFeatured(row.id, v)}
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`hidden items-center gap-0 px-4 py-3.5 md:grid md:items-center ${projectsGridCols}`}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={(checked) =>
                        toggleSelect(row.id, checked === true)
                      }
                      aria-label={`Select ${row.title}`}
                    />
                  </div>
                  <div className="flex items-center">
                    <img
                      src={
                        row.image_url?.trim()
                          ? row.image_url
                          : PROJECT_IMAGE_PLACEHOLDER
                      }
                      alt=""
                      className="h-14 w-14 rounded-lg border border-white/[0.08] bg-black/30 object-cover lg:h-[4.5rem] lg:w-[4.5rem]"
                    />
                  </div>
                  <div className="min-w-0 pr-3 lg:pr-4">
                    <Link
                      href={`/admin/projects/${row.id}`}
                      className="block line-clamp-1 text-sm font-medium text-white/85 transition-colors hover:text-white"
                    >
                      {row.title}
                    </Link>
                    {row.description?.trim() ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">
                        {row.description.trim()}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className="min-w-0 text-sm text-white/55"
                    title={row.category || undefined}
                  >
                    <span className="line-clamp-2">
                      {row.category?.trim() ? row.category : "  "}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="tabular-nums text-xs text-white/40">
                    {formatDate(row.updated_at)}
                  </div>
                  <div className="flex justify-center">
                    <ToggleSwitch
                      checked={row.featured}
                      disabled={row.status === "trash"}
                      onChange={(v) => void toggleFeatured(row.id, v)}
                    />
                  </div>
                  <div className="flex justify-end">
                    <ProjectRowActions
                      row={row}
                      onMoveToTrash={(id) =>
                        setDeleteDialog({ id, permanent: false })
                      }
                      onRestoreDraft={(id) => void restoreDraft(id)}
                      onPermanentDelete={(id) =>
                        setDeleteDialog({ id, permanent: true })
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-4">
            <AdminListPagination
              page={page}
              totalItems={filtered.length}
              onPageChange={handlePageChange}
              aria-label="Admin projects pagination"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={
          deleteDialog?.permanent
            ? "Delete project permanently?"
            : "Move project to trash?"
        }
        message={
          deleteDialog?.permanent
            ? "This permanently removes the project from the database. This cannot be undone."
            : "The project will be hidden from the public site and listed under Trash. You can restore it anytime."
        }
        danger={deleteDialog?.permanent}
        confirmLabel={
          deleteDialog?.permanent ? "Delete permanently" : "Move to trash"
        }
        onCancel={() => setDeleteDialog(null)}
        onConfirm={() => void confirmDelete()}
      />
      {children}
    </div>
  );
}
