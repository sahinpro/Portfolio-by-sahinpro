"use client";

import { AdminListPagination } from "@/admin/components/ui/AdminListPagination";
import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { useToast } from "@/admin/context/ToastContext";
import { adminAuthHeader } from "@/admin/lib/challengeMappers";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LIST_PAGE_SIZE } from "@/lib/pagination";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Target,
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

type ChallengeListRow = {
  slug: string;
  title: string;
  updatedAt: string;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function EmptyState({ search }: { search: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <Target className="h-8 w-8 text-white/20" aria-hidden />
      <p className="mt-3 text-sm font-medium text-white/70">
        {search ? "No challenges match that search" : "No challenges yet"}
      </p>
      <p className="mt-1 max-w-sm text-xs text-white/40">
        {search
          ? "Try a different title."
          : "Add an HTML file. It stays in this project and opens here."}
      </p>
      {!search ? (
        <Link
          href="/admin/challenges/new"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New challenge
        </Link>
      ) : null}
    </div>
  );
}

function RowActions({
  row,
  onDelete,
}: {
  row: ChallengeListRow;
  onDelete: (slug: string) => void;
}): JSX.Element {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white"
          aria-label={`More actions for ${row.title || "challenge"}`}
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
        className="z-[100] w-44 rounded-xl border border-white/[0.1] bg-zinc-950 p-0 text-white shadow-2xl shadow-black/60"
      >
        <div className="py-1">
          <Link
            href={`/admin/challenges/${row.slug}/edit`}
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
              onDelete(row.slug);
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

const gridCols = "md:grid-cols-[minmax(0,1fr)_140px_44px]";

export function AdminChallengesListPage({
  children,
}: {
  children?: ReactNode;
}): JSX.Element {
  const pathname = usePathname();
  const prevPathRef = useRef<string | null>(null);
  const { showToast } = useToast();
  const [rows, setRows] = useState<ChallengeListRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/challenges", {
        headers: await adminAuthHeader(),
      });
      const body = (await response.json()) as {
        challenges?: ChallengeListRow[];
        error?: string;
      };
      if (!response.ok) {
        showToast(body.error ?? "Could not load challenges", "error");
        return;
      }
      setRows(body.challenges ?? []);
    } catch {
      showToast("Could not load challenges", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (
      prev !== null &&
      prev !== "/admin/challenges" &&
      pathname === "/admin/challenges"
    ) {
      void load();
    }
  }, [pathname, load]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => row.title.toLowerCase().includes(query));
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIST_PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * LIST_PAGE_SIZE,
    safePage * LIST_PAGE_SIZE,
  );

  const confirmDelete = async () => {
    if (!deleteSlug) return;
    const slug = deleteSlug;
    setDeleteSlug(null);
    const response = await fetch(`/api/admin/challenges/${slug}`, {
      method: "DELETE",
      headers: await adminAuthHeader(),
    });
    if (!response.ok) {
      const body = (await response.json()) as { error?: string };
      showToast(body.error ?? "Could not delete challenge", "error");
      return;
    }
    setRows((prev) => prev.filter((row) => row.slug !== slug));
    showToast("Challenge deleted");
  };

  return (
    <div className="max-w-6xl space-y-6 xl:max-w-[90rem]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Challenges
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            HTML sheets stored in this project. They open only inside admin, so
            the public site stays unchanged.
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
            href="/admin/challenges/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            New challenge
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-end">
        <div className="relative w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/30" />
          <Input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search challenges..."
            className="w-full rounded-lg border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]"
          />
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08]">
        <div className="hidden border-b border-white/[0.06] bg-white/[0.02] md:block">
          <div className={`grid gap-0 px-4 py-2.5 ${gridCols}`}>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Challenge
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
                  <div className="h-4 w-1/2 rounded bg-white/10 md:hidden" />
                  <div className={`hidden md:grid md:items-center ${gridCols} gap-3`}>
                    <div className="h-4 w-48 rounded bg-white/10" />
                    <div className="h-4 w-20 rounded bg-white/[0.06]" />
                    <div />
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <div>
            {paginated.map((row) => (
              <div
                key={row.slug}
                className="group border-b border-white/[0.04] transition-colors last:border-b-0 hover:bg-white/[0.025]"
              >
                <div className="flex items-start justify-between gap-2 px-4 py-3.5 md:hidden">
                  <div className="min-w-0">
                    <Link
                      href={`/admin/challenges/${row.slug}`}
                      className="text-sm font-medium text-white/85 hover:text-white"
                    >
                      {row.title || "Untitled challenge"}
                    </Link>
                    <p className="mt-1 text-[11px] text-white/35">
                      {formatDate(row.updatedAt)}
                    </p>
                  </div>
                  <RowActions row={row} onDelete={setDeleteSlug} />
                </div>

                <div className={`hidden items-center gap-3 px-4 py-3.5 md:grid ${gridCols}`}>
                  <Link
                    href={`/admin/challenges/${row.slug}`}
                    className="truncate text-sm font-medium text-white/85 hover:text-white"
                  >
                    {row.title || "Untitled challenge"}
                  </Link>
                  <span className="text-sm tabular-nums text-white/40">
                    {formatDate(row.updatedAt)}
                  </span>
                  <RowActions row={row} onDelete={setDeleteSlug} />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-4">
            <AdminListPagination
              page={safePage}
              totalItems={filtered.length}
              onPageChange={setPage}
              aria-label="Admin challenges pagination"
            />
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteSlug)}
        title="Delete this challenge?"
        message="This removes the HTML file and any CSV files saved beside it. This cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteSlug(null)}
        onConfirm={() => void confirmDelete()}
      />
      {children}
    </div>
  );
}
