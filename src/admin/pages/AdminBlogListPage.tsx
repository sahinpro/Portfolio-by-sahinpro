import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BlogPostRow } from "@/admin/types/database";
import { BLOG_COVER_PLACEHOLDER } from "@/constants/placeholders";
import { supabase } from "@/utils/supabase";
import {
  BookOpen,
  Clock,
  ExternalLink,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Filter = "all" | "published" | "draft" | "trash";
type BulkAction = "none" | "draft" | "published" | "trash";
type DeleteDialogState = { id: string; permanent: boolean } | null;

function RowActions({
  row,
  onTrash,
  onPermanentDelete,
}: {
  row: BlogPostRow;
  onTrash: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-md p-1.5 text-white/35 transition-colors hover:bg-white/[0.07] hover:text-white"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-full z-20 mt-1 w-44 overflow-hidden rounded-xl border border-white/[0.1]
          bg-zinc-950 shadow-2xl shadow-black/60"
        >
          <div className="py-1">
            <Link
              to={`/admin/blog/${row.id}`}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
              onClick={() => setOpen(false)}
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit post
            </Link>
            {row.slug ? (
              <a
                href={`/blogs/${row.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70 transition-colors hover:bg-white/[0.05] hover:text-white"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View post
              </a>
            ) : null}
            <div className="mx-2 my-1 h-px bg-white/[0.06]" />
            <button
              type="button"
              onClick={() => {
                if (row.status === "trash") {
                  onPermanentDelete(row.id);
                } else {
                  onTrash(row.id);
                }
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-500/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {row.status === "trash" ? "Delete permanently" : "Move to trash"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function EmptyState({ search, filter }: { search: string; filter: Filter }) {
  const message = search || filter !== "all" ? "No posts match your search." : "No blog posts yet.";
  const hint = search || filter !== "all" ? "Try adjusting your filters." : "Create your first post to get started.";

  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.07]
        bg-white/[0.04] text-white/20"
      >
        <BookOpen className="h-5 w-5" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white/60">{message}</p>
        <p className="mt-0.5 text-xs text-white/30">{hint}</p>
      </div>
      {!(search || filter !== "all") ? (
        <Link
          to="/admin/blog/new"
          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      ) : null}
    </div>
  );
}

export function AdminBlogListPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>("none");
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialogState>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("updated_at", { ascending: false });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((data ?? []) as BlogPostRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setSelectedIds([]);
    setBulkAction("none");
  }, [filter, search]);

  const filtered = rows.filter((row) => {
    if (filter !== "all" && row.status !== filter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const excerpt = (row.excerpt ?? "").toLowerCase();
    return row.title.toLowerCase().includes(q) || row.slug.toLowerCase().includes(q) || excerpt.includes(q);
  });

  const filteredIds = filtered.map((row) => row.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every((id) => selectedIds.includes(id));
  const someFilteredSelected = filteredIds.some((id) => selectedIds.includes(id));

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((value) => value !== id)));
  };

  const toggleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredIds : []);
  };

  const bulkUpdateStatus = async (status: BlogPostRow["status"]) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from("blog_posts").update({ status }).in("id", selectedIds);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((prev) => prev.map((row) => (selectedIds.includes(row.id) ? { ...row, status } : row)));
    showToast(`${selectedIds.length} post${selectedIds.length === 1 ? "" : "s"} updated`);
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

  const confirmDelete = async () => {
    if (!deleteDialog) return;
    const { id, permanent } = deleteDialog;
    const query = permanent
      ? supabase.from("blog_posts").delete().eq("id", id)
      : supabase.from("blog_posts").update({ status: "trash" }).eq("id", id);
    const { error } = await query;
    setDeleteDialog(null);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    if (permanent) {
      showToast("Post deleted permanently");
      setRows((prev) => prev.filter((row) => row.id !== id));
      setSelectedIds((prev) => prev.filter((value) => value !== id));
      return;
    }
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: "trash" } : row)));
    setSelectedIds((prev) => prev.filter((value) => value !== id));
    showToast("Post moved to trash");
  };

  const counts = {
    all: rows.length,
    published: rows.filter((row) => row.status === "published").length,
    draft: rows.filter((row) => row.status === "draft").length,
    trash: rows.filter((row) => row.status === "trash").length,
  };

  return (
    <div className="max-w-6xl space-y-6 xl:max-w-[90rem]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Blog</h1>
          <p className="mt-0.5 text-sm text-white/40">Manage your articles. Published posts appear on the public site.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="rounded-lg border border-white/[0.10] bg-white/[0.03] p-2 text-white/50 transition-all hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            New post
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Select value={bulkAction} onValueChange={(value) => setBulkAction(value as BulkAction)}>
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
                  filter === value ? "bg-white/[0.12] text-white shadow-sm" : "text-white/40 hover:text-white/70"
                }`}
              >
                {value}
                <span className={`tabular-nums text-[11px] ${filter === value ? "text-white/60" : "text-white/25"}`}>
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
              placeholder="Search posts..."
              className="w-full rounded-lg border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 transition-all focus-visible:border-white/[0.18] focus-visible:bg-white/[0.06]"
            />
          </div>
          <p className="text-sm text-white/55">
            {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select one or more posts"}
          </p>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08]">
        <div className="hidden border-b border-white/[0.06] bg-white/[0.02] md:block">
          <div
            className="grid gap-0 px-4 py-2.5
              grid-cols-[40px_72px_1fr_140px_72px_44px]
              lg:grid-cols-[40px_88px_1fr_160px_80px_44px]"
          >
            <span className="flex items-center">
              <Checkbox
                checked={allFilteredSelected || (someFilteredSelected ? "indeterminate" : false)}
                onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                aria-label="Select all posts"
              />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Cover</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Title</span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">Date</span>
            <span className="text-center text-[11px] font-semibold uppercase tracking-wider text-white/30">Read</span>
            <span />
          </div>
        </div>

        {loading ? (
          <div>
            {Array.from({ length: 5 }).map((_, index) => (
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
                  className="hidden animate-pulse border-b border-white/[0.04] px-4 py-3.5 last:border-b-0 md:grid
                  md:grid-cols-[40px_72px_1fr_140px_72px_44px]
                  lg:grid-cols-[40px_88px_1fr_160px_80px_44px]"
                >
                  <div className="h-4 w-4 self-center rounded bg-white/[0.06]" />
                  <div className="h-14 w-14 rounded-lg bg-white/10" />
                  <div>
                    <div className="mb-1.5 h-4 w-48 rounded bg-white/10" />
                    <div className="h-3 w-32 rounded bg-white/[0.06]" />
                  </div>
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
            {filtered.map((row) => (
              <div
                key={row.id}
                className={`group border-b border-white/[0.04] last:border-b-0 transition-colors ${
                  selectedIds.includes(row.id) ? "bg-white/[0.04]" : "hover:bg-white/[0.025]"
                }`}
              >
                <div className="px-4 py-3.5 md:hidden">
                  <div className="flex gap-3">
                    <div className="pt-1">
                      <Checkbox
                        checked={selectedIds.includes(row.id)}
                        onCheckedChange={(checked) => toggleSelect(row.id, checked === true)}
                        aria-label={`Select ${row.title}`}
                      />
                    </div>
                    <div className="flex shrink-0 items-start">
                      <img
                        src={row.cover_image?.trim() ? row.cover_image : BLOG_COVER_PLACEHOLDER}
                        alt=""
                        className="h-14 w-14 rounded-lg border border-white/[0.08] bg-black/30 object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/admin/blog/${row.id}`}
                          className="line-clamp-2 text-sm font-medium text-white/85 transition-colors hover:text-white"
                        >
                          {row.title}
                        </Link>
                        <RowActions
                          row={row}
                          onTrash={(id) => setDeleteDialog({ id, permanent: false })}
                          onPermanentDelete={(id) => setDeleteDialog({ id, permanent: true })}
                        />
                      </div>
                      {row.excerpt?.trim() ? (
                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">{row.excerpt.trim()}</p>
                      ) : null}
                      <span className="mt-1 block truncate font-mono text-[11px] text-white/28">/{row.slug}</span>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-white/40">
                        <span className="tabular-nums">{formatDate(row.updated_at)}</span>
                        {row.reading_time != null ? (
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3 w-3 shrink-0" />
                            {row.reading_time}m
                          </span>
                        ) : null}
                        <StatusBadge status={row.status} />
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="hidden items-center gap-0 px-4 py-3.5 md:grid
                  md:grid-cols-[40px_72px_1fr_140px_72px_44px]
                  lg:grid-cols-[40px_88px_1fr_160px_80px_44px]"
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      onCheckedChange={(checked) => toggleSelect(row.id, checked === true)}
                      aria-label={`Select ${row.title}`}
                    />
                  </div>
                  <div className="flex items-center">
                    <img
                      src={row.cover_image?.trim() ? row.cover_image : BLOG_COVER_PLACEHOLDER}
                      alt=""
                      className="h-14 w-14 rounded-lg border border-white/[0.08] bg-black/30 object-cover lg:h-[4.5rem] lg:w-[4.5rem]"
                    />
                  </div>
                  <div className="min-w-0 pr-3 lg:pr-4">
                    <Link
                      to={`/admin/blog/${row.id}`}
                      className="block line-clamp-1 text-sm font-medium text-white/85 transition-colors hover:text-white"
                    >
                      {row.title}
                    </Link>
                    {row.excerpt?.trim() ? (
                      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/40">{row.excerpt.trim()}</p>
                    ) : null}
                    <span className="mt-1 block font-mono text-[11px] text-white/28">/{row.slug}</span>
                  </div>
                  <div className="tabular-nums text-xs text-white/40">{formatDate(row.updated_at)}</div>
                  <div className="text-center text-xs text-white/40">
                    {row.reading_time != null ? (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {row.reading_time}m
                      </span>
                    ) : (
                      "—"
                    )}
                  </div>
                  <div className="flex justify-end">
                    <RowActions
                      row={row}
                      onTrash={(id) => setDeleteDialog({ id, permanent: false })}
                      onPermanentDelete={(id) => setDeleteDialog({ id, permanent: true })}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 ? (
          <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-3">
            <p className="text-xs tabular-nums text-white/25">
              {filtered.length} of {rows.length} post{rows.length !== 1 ? "s" : ""}
            </p>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(deleteDialog)}
        title={deleteDialog?.permanent ? "Delete post permanently?" : "Move post to trash?"}
        message={
          deleteDialog?.permanent
            ? "This will permanently remove the post and cannot be undone."
            : "The post will be moved to trash. You can restore it later by changing its status."
        }
        danger={deleteDialog?.permanent}
        confirmLabel={deleteDialog?.permanent ? "Delete permanently" : "Move to trash"}
        onCancel={() => setDeleteDialog(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
