"use client";

import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import type { ProjectRow, TestimonialRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import { invalidateTestimonialsPublicCache } from "@/lib/publicDataCache";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import { supabase } from "@/utils/supabase";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Fragment,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AdminListPagination } from "@/admin/components/ui/AdminListPagination";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Filter = "all" | "assigned" | "unassigned";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function clientInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  const first = parts[0][0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return `${first}${last}`.toUpperCase();
}

function EmptyState({
  search,
  filter,
}: {
  search: string;
  filter: Filter;
}): JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Quote className="h-8 w-8 text-white/20" aria-hidden />
      <p className="mt-3 text-sm font-medium text-white/70">
        {search
          ? "No testimonials match that search"
          : filter === "assigned"
            ? "No testimonials assigned to a project yet"
            : filter === "unassigned"
              ? "Every testimonial is already assigned"
              : "No testimonials yet"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-white/40">
        {search
          ? "Try a different name, quote, or project title."
          : "Add a client quote, then assign it to a project so it appears on that case-study page."}
      </p>
      {!search ? (
        <Link
          href="/admin/testimonials/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New testimonial
        </Link>
      ) : null}
    </div>
  );
}

function RowActions({
  row,
  onDelete,
}: {
  row: TestimonialRow;
  onDelete: (id: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label={`More actions for ${row.client_name || "testimonial"}`}
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
        className="w-44 p-0 rounded-xl border border-white/[0.1] bg-zinc-950 text-white shadow-2xl shadow-black/60 z-[100]"
      >
        <div className="py-1">
          <Link
            href={`/admin/testimonials/${row.id}`}
            className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
            onClick={() => setOpen(false)}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
          <div className="mx-2 my-1 h-px bg-white/[0.06]" />
          <button
            type="button"
            onClick={() => {
              onDelete(row.id);
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-400/90 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

const gridCols =
  "md:grid-cols-[72px_minmax(0,0.9fr)_minmax(0,1.4fr)_minmax(0,0.9fr)_112px_44px]";

export function AdminTestimonialsListPage({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const projectTitleById = useMemo(() => {
    return new Map(projects.map((project) => [project.id, project.title]));
  }, [projects]);

  const load = useCallback(async () => {
    setLoading(true);
    const [testimonialsRes, projectsRes] = await Promise.all([
      supabase.from("testimonials").select("*").order("updated_at", {
        ascending: false,
      }),
      supabase.from("projects").select("id, title, status"),
    ]);
    setLoading(false);
    if (testimonialsRes.error) {
      showToast(withRlsHint(testimonialsRes.error.message), "error");
      return;
    }
    if (projectsRes.error) {
      showToast(withRlsHint(projectsRes.error.message), "error");
    }
    setRows((testimonialsRes.data ?? []) as TestimonialRow[]);
    setProjects((projectsRes.data ?? []) as ProjectRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (
      prev !== null &&
      prev !== "/admin/testimonials" &&
      pathname === "/admin/testimonials"
    ) {
      void load();
    }
  }, [pathname, load]);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (filter === "assigned" && !row.project_id) return false;
      if (filter === "unassigned" && row.project_id) return false;
      if (!q) return true;
      const projectTitle = row.project_id
        ? (projectTitleById.get(row.project_id) ?? "")
        : "";
      return (
        row.quote.toLowerCase().includes(q) ||
        row.client_name.toLowerCase().includes(q) ||
        (row.client_role ?? "").toLowerCase().includes(q) ||
        projectTitle.toLowerCase().includes(q)
      );
    });
  }, [filter, projectTitleById, rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * LIST_PAGE_SIZE,
    safePage * LIST_PAGE_SIZE,
  );

  const counts = {
    all: rows.length,
    assigned: rows.filter((row) => Boolean(row.project_id)).length,
    unassigned: rows.filter((row) => !row.project_id).length,
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", deleteId);
    setDeleteId(null);
    if (error) {
      showToast(withRlsHint(error.message), "error");
      return;
    }
    setRows((prev) => prev.filter((row) => row.id !== deleteId));
    void invalidateTestimonialsPublicCache();
    showToast("Testimonial deleted");
  };

  return (
    <div className="max-w-6xl space-y-6 xl:max-w-[90rem]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Testimonials
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            Manage client quotes, then assign one to a project to show it on
            that case-study page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            href="/admin/testimonials/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            New testimonial
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
          {(["all", "assigned", "unassigned"] as const).map((value) => (
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
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search testimonials..."
            className="w-full rounded-lg border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]"
          />
        </div>
      </div>

      <div
        ref={listRef}
        className="min-w-0 scroll-mt-6 overflow-hidden rounded-xl border border-white/[0.08]"
      >
        <div className="hidden border-b border-white/[0.06] bg-white/[0.02] md:block">
          <div className={`grid gap-0 px-4 py-2.5 md:grid ${gridCols}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Photo
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Client
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Quote
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Assigned project
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Updated
            </span>
            <span />
          </div>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: LIST_PAGE_SIZE }).map((_, index) => (
              <Fragment key={index}>
                <div className="animate-pulse border-b border-white/[0.04] px-4 py-3.5 last:border-b-0">
                  <div className="flex gap-3 md:hidden">
                    <div className="h-12 w-12 shrink-0 rounded-full bg-white/10" />
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="h-4 w-1/2 rounded bg-white/10" />
                      <div className="h-3 w-3/4 rounded bg-white/[0.06]" />
                    </div>
                  </div>
                  <div
                    className={`hidden md:grid md:items-center ${gridCols} gap-3`}
                  >
                    <div className="h-12 w-12 rounded-full bg-white/10" />
                    <div className="h-4 w-32 rounded bg-white/10" />
                    <div className="h-4 w-full max-w-sm rounded bg-white/[0.06]" />
                    <div className="h-4 w-28 rounded bg-white/[0.06]" />
                    <div className="h-4 w-20 rounded bg-white/[0.06]" />
                    <div />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          <div>
            {paginated.map((row) => {
              const assignedTitle = row.project_id
                ? projectTitleById.get(row.project_id)
                : undefined;
              return (
                <div
                  key={row.id}
                  className="group border-b border-white/[0.04] last:border-b-0 transition-colors hover:bg-white/[0.025]"
                >
                  <div className="px-4 py-3.5 md:hidden">
                    <div className="flex gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-white/[0.08] bg-[#2a4a66]">
                        {row.client_photo ? (
                          <img
                            src={row.client_photo}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/80">
                            {clientInitials(row.client_name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/admin/testimonials/${row.id}`}
                            className="text-sm font-medium text-white/85 hover:text-white"
                          >
                            {row.client_name || "Untitled client"}
                          </Link>
                          <RowActions
                            row={row}
                            onDelete={(id) => setDeleteId(id)}
                          />
                        </div>
                        {row.client_role ? (
                          <p className="mt-0.5 text-xs text-white/40">
                            {row.client_role}
                          </p>
                        ) : null}
                        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-white/50">
                          {row.quote}
                        </p>
                        <p className="mt-2 text-[11px] text-white/35">
                          {assignedTitle
                            ? `Assigned to ${assignedTitle}`
                            : "Not assigned"}
                          <span className="mx-1.5 text-white/20">·</span>
                          {formatDate(row.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`hidden items-center gap-3 px-4 py-3.5 md:grid ${gridCols}`}
                  >
                    <div className="relative h-12 w-12 overflow-hidden rounded-full border border-white/[0.08] bg-[#2a4a66]">
                      {row.client_photo ? (
                        <img
                          src={row.client_photo}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-white/80">
                          {clientInitials(row.client_name)}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/admin/testimonials/${row.id}`}
                        className="block truncate text-sm font-medium text-white/85 hover:text-white"
                      >
                        {row.client_name || "Untitled client"}
                      </Link>
                      {row.client_role ? (
                        <p className="truncate text-xs text-white/40">
                          {row.client_role}
                        </p>
                      ) : null}
                    </div>
                    <p className="line-clamp-2 text-sm leading-relaxed text-white/55">
                      {row.quote}
                    </p>
                    <p className="truncate text-sm text-white/50">
                      {assignedTitle ?? (
                        <span className="text-white/30">Not assigned</span>
                      )}
                    </p>
                    <span className="text-sm tabular-nums text-white/40">
                      {formatDate(row.updated_at)}
                    </span>
                    <RowActions
                      row={row}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-4">
            <AdminListPagination
              page={safePage}
              totalItems={filtered.length}
              onPageChange={setPage}
              aria-label="Admin testimonials pagination"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete this testimonial?"
        message="This removes the quote from the admin and from any assigned project page. This cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
      {children}
    </div>
  );
}
