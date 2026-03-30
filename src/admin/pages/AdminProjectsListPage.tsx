import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import type { ProjectRow } from "@/admin/types/database";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";
import { Input } from "@/components/ui/input";
import { supabase } from "@/utils/supabase";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const inputSearch =
  "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";

export function AdminProjectsListPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [q, setQ] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

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

  const filtered = rows.filter((r) => {
    if (filter === "published" && r.status !== "published") return false;
    if (filter === "draft" && r.status !== "draft") return false;
    if (q.trim() && !r.title.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
  });

  const toggleFeatured = async (id: string, featured: boolean) => {
    const { error } = await supabase.from("projects").update({ featured }).eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("projects").delete().eq("id", deleteId);
    setDeleteId(null);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("Project deleted");
    void load();
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-white/45 mt-1">Manage portfolio case studies.</p>
        </div>
        <Link
          to="/admin/projects/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          New project
        </Link>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center mb-6">
        <Input
          type="search"
          placeholder="Search title…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className={`${inputSearch} flex-1 max-w-xs`}
        />
        <div className="flex rounded-lg border border-white/10 p-0.5 bg-white/[0.02]">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                filter === f ? "bg-white/15 text-white" : "text-white/45 hover:text-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#111]">
        {loading ? (
          <p className="p-8 text-sm text-white/45 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="p-8 text-sm text-white/45 text-center">No projects match.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.08] text-[11px] uppercase tracking-wider text-white/40">
                  <th className="px-4 py-3 w-14" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-white/[0.05] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-2">
                      <img
                        src={r.image_url?.trim() ? r.image_url : PROJECT_IMAGE_PLACEHOLDER}
                        alt=""
                        className="h-10 w-14 rounded object-cover bg-white/5 border border-white/[0.06]"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="font-medium text-white">{r.title}</div>
                      {r.description?.trim() ? (
                        <p className="text-xs text-white/45 mt-1 line-clamp-2 leading-relaxed max-w-md">
                          {r.description.trim()}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-white/55">{r.category}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-2">
                      <ToggleSwitch
                        checked={r.featured}
                        onChange={(v) => void toggleFeatured(r.id, v)}
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/admin/projects/${r.id}`}
                          className="rounded-lg p-2 text-white/50 hover:bg-white/[0.08] hover:text-white"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeleteId(r.id)}
                          className="rounded-lg p-2 text-red-400/70 hover:bg-red-500/10 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(deleteId)}
        title="Delete project?"
        message="This cannot be undone."
        danger
        confirmLabel="Delete"
        onCancel={() => setDeleteId(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
