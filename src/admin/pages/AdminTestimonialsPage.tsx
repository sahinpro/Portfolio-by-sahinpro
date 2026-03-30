import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { SlideOver } from "@/admin/components/ui/SlideOver";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import type { TestimonialRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

export function AdminTestimonialsPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [form, setForm] = useState({
    author_name: "",
    author_role: "",
    author_company: "",
    author_avatar: "",
    quote: "",
    highlighted_quote: "",
    status: "draft" as "draft" | "published",
    sort_order: 0,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((data ?? []) as TestimonialRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setForm({
      author_name: "",
      author_role: "",
      author_company: "",
      author_avatar: "",
      quote: "",
      highlighted_quote: "",
      status: "draft",
      sort_order: rows.length,
    });
    setOpen(true);
  };

  const openEdit = (r: TestimonialRow) => {
    setEditing(r);
    setForm({
      author_name: r.author_name,
      author_role: r.author_role ?? "",
      author_company: r.author_company ?? "",
      author_avatar: r.author_avatar ?? "",
      quote: r.quote,
      highlighted_quote: r.highlighted_quote ?? "",
      status: r.status,
      sort_order: r.sort_order,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.author_name.trim() || !form.quote.trim()) {
      showToast("Name and quote are required", "error");
      return;
    }
    setSaving(true);
    const payload = {
      author_name: form.author_name.trim(),
      author_role: form.author_role.trim() || null,
      author_company: form.author_company.trim() || null,
      author_avatar: form.author_avatar.trim() || null,
      quote: form.quote.trim(),
      highlighted_quote: form.highlighted_quote.trim() || null,
      status: form.status,
      sort_order: form.sort_order,
    };
    if (editing) {
      const { error } = await supabase.from("testimonials").update(payload).eq("id", editing.id);
      setSaving(false);
      if (error) {
        showToast(error.message, "error");
        return;
      }
    } else {
      const { error } = await supabase.from("testimonials").insert(payload);
      setSaving(false);
      if (error) {
        showToast(error.message, "error");
        return;
      }
    }
    showToast("Saved");
    setOpen(false);
    void load();
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Testimonials</h1>
          <p className="text-sm text-white/45 mt-1">Customer stories on the home page.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black"
        >
          <Plus className="h-4 w-4" />
          Add testimonial
        </button>
      </div>

      {loading ? (
        <p className="text-white/45 text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => openEdit(r)}
              className="text-left rounded-xl border border-white/[0.08] bg-[#111] p-4 hover:border-white/[0.14] transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                {r.author_avatar ? (
                  <img
                    src={r.author_avatar}
                    alt=""
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-white/10" />
                )}
                <div>
                  <p className="font-medium text-white">{r.author_name}</p>
                  <p className="text-xs text-white/45">
                    {r.author_role}
                    {r.author_company ? ` · ${r.author_company}` : ""}
                  </p>
                </div>
              </div>
              <p className="text-sm text-white/55 line-clamp-3">{r.quote}</p>
              <div className="mt-3">
                <StatusBadge status={r.status} />
              </div>
            </button>
          ))}
        </div>
      )}

      <SlideOver
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit testimonial" : "New testimonial"}
        wide
        footer={
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-white/80"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Author name</label>
              <Input
                className={field}
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Sort order</label>
              <Input
                type="number"
                className={field}
                value={form.sort_order}
                onChange={(e) =>
                  setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Role</label>
              <Input
                className={field}
                value={form.author_role}
                onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
              />
            </div>
            <div>
              <label className={labelCls}>Company</label>
              <Input
                className={field}
                value={form.author_company}
                onChange={(e) => setForm((f) => ({ ...f, author_company: e.target.value }))}
              />
            </div>
          </div>
          <ImageUrlField
            label="Author avatar"
            value={form.author_avatar}
            onChange={(url) => setForm((f) => ({ ...f, author_avatar: url }))}
            bucket="portfolio-assets"
            pathPrefix="testimonials"
          />
          <div>
            <label className={labelCls}>Quote</label>
            <Textarea
              className={`${field} min-h-[100px]`}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Highlighted quote (HTML)</label>
            <Textarea
              className={`${field} min-h-[100px] font-mono text-xs`}
              value={form.highlighted_quote}
              onChange={(e) => setForm((f) => ({ ...f, highlighted_quote: e.target.value }))}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <Select
              value={form.status}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  status: v as "draft" | "published",
                }))
              }
            >
              <SelectTrigger className={field}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-[#111] text-white">
                <SelectItem value="draft" className="focus:bg-white/10">
                  Draft
                </SelectItem>
                <SelectItem value="published" className="focus:bg-white/10">
                  Published
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SlideOver>
    </div>
  );
}
