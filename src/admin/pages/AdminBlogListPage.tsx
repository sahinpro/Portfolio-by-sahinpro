import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import type { BlogPostRow } from "@/admin/types/database";
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
import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

/* ─────────────── helpers ─────────────── */

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type Filter = "all" | "published" | "draft";

/* ─────────────── row actions dropdown ─────────────── */

function RowActions({
  row,
  onDelete,
}: {
  row: BlogPostRow;
  onDelete: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-md text-white/35 hover:text-white hover:bg-white/[0.07] transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-white/[0.1]
          bg-zinc-950 shadow-2xl shadow-black/60 z-20 overflow-hidden"
        >
          <div className="py-1">
            <Link
              to={`/admin/blog/${row.id}`}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70
                hover:text-white hover:bg-white/[0.05] transition-colors"
              onClick={() => setOpen(false)}
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit post
            </Link>
            {row.slug && (
              <a
                href={`/blogs/${row.slug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-white/70
                  hover:text-white hover:bg-white/[0.05] transition-colors"
                onClick={() => setOpen(false)}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View post
              </a>
            )}
            <div className="h-px bg-white/[0.06] mx-2 my-1" />
            <button
              type="button"
              onClick={() => {
                onDelete(row.id);
                setOpen(false);
              }}
              className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-400 w-full text-left
                hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────── empty state ─────────────── */

function EmptyState({ search, filter }: { search: string; filter: Filter }) {
  const message =
    search || filter !== "all"
      ? "No posts match your search."
      : "No blog posts yet.";
  const hint =
    search || filter !== "all"
      ? "Try adjusting your filters."
      : "Create your first post to get started.";

  return (
    <div className="flex flex-col items-center gap-3 py-16">
      <div
        className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.07]
        flex items-center justify-center text-white/20"
      >
        <BookOpen className="w-5 h-5" />
      </div>
      <div className="text-center">
        <p className="text-sm text-white/60 font-medium">{message}</p>
        <p className="text-xs text-white/30 mt-0.5">{hint}</p>
      </div>
      {!(search || filter !== "all") && (
        <Link
          to="/admin/blog/new"
          className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-black
            text-sm font-semibold hover:bg-white/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New post
        </Link>
      )}
    </div>
  );
}

/* ─────────────── page ─────────────── */

export function AdminBlogListPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

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

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this post? This cannot be undone.")) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Post deleted");
    setRows((r) => r.filter((p) => p.id !== id));
  };

  const filtered = rows.filter((r) => {
    if (filter !== "all" && r.status !== filter) return false;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const excerpt = (r.excerpt ?? "").toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        excerpt.includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
  };

  return (
    <div className="max-w-6xl xl:max-w-[90rem] space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Blog
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Manage your articles — published posts appear on the public site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="p-2 rounded-lg border border-white/[0.10] bg-white/[0.03] text-white/50
              hover:text-white hover:bg-white/[0.06] disabled:opacity-40 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            to="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black
              text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New post
          </Link>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Tab filters */}
        <div className="flex rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium
                capitalize transition-all ${
                  filter === f
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
            >
              {f}
              <span
                className={`tabular-nums text-[11px] ${filter === f ? "text-white/60" : "text-white/25"}`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative sm:ml-auto w-full sm:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-8.5 pl-9 pr-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08]
              text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/[0.18]
              focus:bg-white/[0.06] transition-all"
          />
        </div>
      </div>

      {/* ── Table ── */}
      <div className="rounded-xl border border-white/[0.08] overflow-hidden">
        {/* Table header */}
        <div className="bg-white/[0.02] border-b border-white/[0.06]">
          <div
            className="grid gap-0 px-4 py-2.5
              grid-cols-[72px_1fr_140px_72px_100px_44px]
              lg:grid-cols-[88px_1fr_160px_80px_100px_44px]"
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Cover
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Title
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Date
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30 text-center">
              Read
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/30">
              Status
            </span>
            <span />
          </div>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="grid gap-0 px-4 py-3.5 animate-pulse
                  grid-cols-[72px_1fr_140px_72px_100px_44px]
                  lg:grid-cols-[88px_1fr_160px_80px_100px_44px]"
              >
                <div className="h-14 w-14 rounded-lg bg-white/10" />
                <div>
                  <div className="h-4 w-48 rounded bg-white/10 mb-1.5" />
                  <div className="h-3 w-32 rounded bg-white/[0.06]" />
                </div>
                <div className="h-4 w-24 rounded bg-white/[0.06] self-center" />
                <div className="h-4 w-10 rounded bg-white/[0.06] self-center mx-auto" />
                <div className="h-5 w-16 rounded-md bg-white/[0.06] self-center" />
                <div />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={search} filter={filter} />
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {filtered.map((row) => (
              <div
                key={row.id}
                className="grid gap-0 px-4 py-3.5 hover:bg-white/[0.025] transition-colors group items-center
                  grid-cols-[72px_1fr_140px_72px_100px_44px]
                  lg:grid-cols-[88px_1fr_160px_80px_100px_44px]"
              >
                <div className="flex items-center">
                  {row.cover_image ? (
                    <img
                      src={row.cover_image}
                      alt=""
                      className="h-14 w-14 lg:h-[4.5rem] lg:w-[4.5rem] rounded-lg object-cover border border-white/[0.08] bg-black/30"
                    />
                  ) : (
                    <div
                      className="h-14 w-14 lg:h-[4.5rem] lg:w-[4.5rem] rounded-lg border border-dashed border-white/[0.1] bg-white/[0.02]
                      flex items-center justify-center"
                    >
                      <BookOpen className="w-5 h-5 text-white/15" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 pr-3 lg:pr-4">
                  <Link
                    to={`/admin/blog/${row.id}`}
                    className="text-sm font-medium text-white/85 hover:text-white line-clamp-1 transition-colors block"
                  >
                    {row.title}
                  </Link>
                  {row.excerpt?.trim() ? (
                    <p className="text-xs text-white/40 line-clamp-2 mt-1 leading-relaxed">
                      {row.excerpt.trim()}
                    </p>
                  ) : null}
                  <span className="text-[11px] text-white/28 font-mono mt-1 block">/{row.slug}</span>
                </div>

                {/* Date */}
                <div className="text-xs text-white/40 tabular-nums">
                  {formatDate(row.updated_at)}
                </div>

                {/* Reading time */}
                <div className="text-xs text-white/40 text-center">
                  {row.reading_time != null ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {row.reading_time}m
                    </span>
                  ) : (
                    "—"
                  )}
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={row.status} />
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <RowActions row={row} onDelete={handleDelete} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-white/[0.06] bg-white/[0.01]">
            <p className="text-xs text-white/25 tabular-nums">
              {filtered.length} of {rows.length} post
              {rows.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
