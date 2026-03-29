import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import type { BlogPostRow } from "@/admin/types/database";
import { supabase } from "@/utils/supabase";
import { Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function AdminBlogListPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<BlogPostRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

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

  const filtered = rows.filter((r) => {
    if (filter === "published" && r.status !== "published") return false;
    if (filter === "draft" && r.status !== "draft") return false;
    return true;
  });

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Blog</h1>
          <p className="text-sm text-white/45 mt-1">Published posts appear on the public <code className="text-white/60">/blogs</code> page.</p>
        </div>
        <Link
          to="/admin/blog/new"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="h-4 w-4" />
          New post
        </Link>
      </div>

      <div className="flex rounded-lg border border-white/10 p-0.5 bg-white/[0.02] w-fit mb-6">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize ${
              filter === f ? "bg-white/15 text-white" : "text-white/45"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-white/45 text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-center text-white/45 text-sm">No posts yet.</p>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/[0.08] text-[11px] uppercase text-white/40">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Read</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b border-white/[0.05] hover:bg-white/[0.02]">
                  <td className="px-4 py-2 font-medium text-white">{r.title}</td>
                  <td className="px-4 py-2 text-white/45 font-mono text-xs">{r.slug}</td>
                  <td className="px-4 py-2">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-2 text-white/50">{r.reading_time ?? "—"} min</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/admin/blog/${r.id}`}
                      className="inline-flex p-2 rounded-lg text-white/50 hover:bg-white/[0.08] hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
