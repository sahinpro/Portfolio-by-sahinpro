import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import type { TestimonialRow } from "@/admin/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
        <Button
          type="button"
          onClick={openNew}
          className="bg-white text-black hover:bg-white/90"
        >
          <Plus className="h-4 w-4" />
          Add testimonial
        </Button>
      </div>

      {loading ? (
        <p className="text-white/45 text-sm">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <Card
              key={r.id}
              className="cursor-pointer border-white/[0.08] bg-[#111] text-left transition-colors hover:border-white/[0.14]"
              onClick={() => openEdit(r)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openEdit(r);
                }
              }}
            >
              <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-3">
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {open ? (
        <AdminSidePanel
          title={editing ? "Edit testimonial" : "New testimonial"}
          description="Manage what appears in the public testimonials section."
          onClose={() => setOpen(false)}
        >
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className={labelCls}>Author name</Label>
              <Input
                className={field}
                value={form.author_name}
                onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
              />
            </div>
            <div>
              <Label className={labelCls}>Sort order</Label>
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
              <Label className={labelCls}>Role</Label>
              <Input
                className={field}
                value={form.author_role}
                onChange={(e) => setForm((f) => ({ ...f, author_role: e.target.value }))}
              />
            </div>
            <div>
              <Label className={labelCls}>Company</Label>
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
            <Label className={labelCls}>Quote</Label>
            <Textarea
              className={`${field} min-h-[100px]`}
              value={form.quote}
              onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
            />
          </div>
          <div>
            <Label className={labelCls}>Highlighted quote (HTML)</Label>
            <Textarea
              className={`${field} min-h-[100px] font-mono text-xs`}
              value={form.highlighted_quote}
              onChange={(e) => setForm((f) => ({ ...f, highlighted_quote: e.target.value }))}
            />
          </div>
          <div>
            <Label className={labelCls}>Status</Label>
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
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-white/15 bg-transparent text-white/80 hover:bg-white/[0.06] hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="bg-white text-black hover:bg-white/90"
            >
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        </AdminSidePanel>
      ) : null}
    </div>
  );
}
