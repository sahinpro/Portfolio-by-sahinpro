import { ConfirmDialog } from "@/admin/components/ui/ConfirmDialog";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import type { ProjectRow } from "@/admin/types/database";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";
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
import { supabase } from "@/utils/supabase";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";

const inputSearch =
  "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";

type Filter = "all" | "published" | "draft" | "trash";
type DeleteDialogState = { id: string; permanent: boolean } | null;
type BulkAction = "none" | "draft" | "published" | "trash";

export function AdminProjectsListPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [q, setQ] = useState("");
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
    setSelectedIds([]);
    setBulkAction("none");
  }, [filter, q]);

  const filtered = rows.filter((r) => {
    if (filter === "published" && r.status !== "published") return false;
    if (filter === "draft" && r.status !== "draft") return false;
    if (filter === "trash" && r.status !== "trash") return false;
    if (q.trim() && !r.title.toLowerCase().includes(q.trim().toLowerCase())) return false;
    return true;
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

  const bulkUpdateStatus = async (status: ProjectRow["status"]) => {
    if (selectedIds.length === 0) return;
    const { error } = await supabase.from("projects").update({ status }).in("id", selectedIds);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((prev) => prev.map((row) => (selectedIds.includes(row.id) ? { ...row, status } : row)));
    showToast(`${selectedIds.length} project${selectedIds.length === 1 ? "" : "s"} updated`);
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
    const { error } = await supabase.from("projects").update({ featured }).eq("id", id);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, featured } : r)));
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
    if (permanent) {
      showToast("Project deleted permanently");
      setRows((prev) => prev.filter((row) => row.id !== id));
      setSelectedIds((prev) => prev.filter((value) => value !== id));
      return;
    }
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status: "trash" } : row)));
    setSelectedIds((prev) => prev.filter((value) => value !== id));
    showToast("Project moved to trash");
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
          {(["all", "published", "draft", "trash"] as const).map((f) => (
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

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 sm:flex-row sm:items-center sm:justify-between">
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
        </div>
        <p className="text-sm text-white/55">
          {selectedIds.length > 0 ? `${selectedIds.length} selected` : "Select one or more projects"}
        </p>
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
                  <th className="px-4 py-3 w-12">
                    <Checkbox
                      checked={allFilteredSelected || (someFilteredSelected ? "indeterminate" : false)}
                      onCheckedChange={(checked) => toggleSelectAll(checked === true)}
                      aria-label="Select all projects"
                    />
                  </th>
                  <th className="px-4 py-3 w-14" />
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    className={`border-b border-white/[0.05] transition-colors ${
                      selectedIds.includes(r.id) ? "bg-white/[0.045]" : "hover:bg-white/[0.02]"
                    }`}
                  >
                    <td className="px-4 py-2">
                      <Checkbox
                        checked={selectedIds.includes(r.id)}
                        onCheckedChange={(checked) => toggleSelect(r.id, checked === true)}
                        aria-label={`Select ${r.title}`}
                      />
                    </td>
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
                          onClick={() =>
                            setDeleteDialog({ id: r.id, permanent: r.status === "trash" })
                          }
                          className="rounded-lg p-2 text-red-400/70 hover:bg-red-500/10 hover:text-red-300"
                          title={r.status === "trash" ? "Delete permanently" : "Move to trash"}
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
        open={Boolean(deleteDialog)}
        title={deleteDialog?.permanent ? "Delete project permanently?" : "Move project to trash?"}
        message={
          deleteDialog?.permanent
            ? "This will permanently remove the project and cannot be undone."
            : "The project will be moved to trash. You can restore it later by changing its status."
        }
        danger={deleteDialog?.permanent}
        confirmLabel={deleteDialog?.permanent ? "Delete permanently" : "Move to trash"}
        onCancel={() => setDeleteDialog(null)}
        onConfirm={() => void confirmDelete()}
      />
    </div>
  );
}
