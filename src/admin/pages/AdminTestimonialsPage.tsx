"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { StatusBadge } from "@/admin/components/ui/StatusBadge";
import { useToast } from "@/admin/context/ToastContext";
import {
  canLenientTestimonialDraftInsert,
  shouldPersistNewTestimonialDraft,
  testimonialToPayload,
  type TestimonialFormState,
} from "@/admin/lib/testimonialDraftHelpers";
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
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import { Plus, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

type StatusFilter = "all" | "published" | "draft";

export function AdminTestimonialsPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<TestimonialRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TestimonialRow | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const newFormBaselineRef = useRef<TestimonialFormState | null>(null);
  const [form, setForm] = useState<TestimonialFormState>({
    author_name: "",
    author_role: "",
    author_company: "",
    author_avatar: "",
    quote: "",
    highlighted_quote: "",
    status: "draft",
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
    const initial: TestimonialFormState = {
      author_name: "",
      author_role: "",
      author_company: "",
      author_avatar: "",
      quote: "",
      highlighted_quote: "",
      status: "draft",
      sort_order: rows.length,
    };
    newFormBaselineRef.current = initial;
    setForm(initial);
    setOpen(true);
  };

  const openEdit = (r: TestimonialRow) => {
    newFormBaselineRef.current = null;
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

  const closePanel = useCallback(() => {
    if (saving) {
      setOpen(false);
      newFormBaselineRef.current = null;
      return;
    }

    if (!editing) {
      const baseline = newFormBaselineRef.current;
      if (!baseline) {
        setOpen(false);
        return;
      }
      if (!shouldPersistNewTestimonialDraft(form, baseline)) {
        setOpen(false);
        newFormBaselineRef.current = null;
        return;
      }
      if (!canLenientTestimonialDraftInsert(form)) {
        showToast("Add a name and quote to save this draft.", "warning");
        setOpen(false);
        newFormBaselineRef.current = null;
        return;
      }
      const payload = testimonialToPayload(form, { forceDraft: true });
      void (async () => {
        try {
          const { error } = await supabase.from("testimonials").insert(payload);
          if (error) showToast(error.message, "error");
          else {
            invalidatePublicDataCache();
            showToast("Draft saved", "success");
          }
        } finally {
          setOpen(false);
          newFormBaselineRef.current = null;
          void load();
        }
      })();
      return;
    }

    const payload = testimonialToPayload(form);
    void (async () => {
      try {
        const { error } = await supabase
          .from("testimonials")
          .update(payload)
          .eq("id", editing.id);
        if (error) showToast(error.message, "error");
        else invalidatePublicDataCache();
      } finally {
        setOpen(false);
        newFormBaselineRef.current = null;
        void load();
      }
    })();
  }, [saving, editing, form, showToast, load]);

  const save = async () => {
    if (!form.author_name.trim() || !form.quote.trim()) {
      showToast("Name and quote are required", "error");
      return;
    }
    setSaving(true);
    const payload = testimonialToPayload(form);
    if (editing) {
      const { error } = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", editing.id);
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
    invalidatePublicDataCache();
    showToast("Saved");
    setOpen(false);
    newFormBaselineRef.current = null;
    void load();
  };

  const counts = {
    all: rows.length,
    published: rows.filter((r) => r.status === "published").length,
    draft: rows.filter((r) => r.status === "draft").length,
  };

  const filteredRows =
    statusFilter === "all"
      ? rows
      : rows.filter((r) => r.status === statusFilter);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Testimonials
          </h1>
          <p className="text-sm text-white/40 mt-1">
            Customer stories on the home page. Only published items are public;
            drafts stay in the admin until you publish.
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
          <Button
            type="button"
            onClick={openNew}
            className="bg-white text-black hover:bg-white/90"
          >
            <Plus className="h-4 w-4" />
            Add testimonial
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5 w-fit">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatusFilter(f)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all ${
              statusFilter === f
                ? "bg-white/[0.12] text-white shadow-sm"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {f}
            <span
              className={`tabular-nums text-[11px] ${statusFilter === f ? "text-white/60" : "text-white/25"}`}
            >
              {counts[f]}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/45 text-sm">Loading…</p>
      ) : filteredRows.length === 0 ? (
        <p className="text-sm text-white/45 py-8 text-center rounded-xl border border-white/[0.08] bg-[#111]">
          {statusFilter === "all"
            ? "No testimonials yet."
            : `No ${statusFilter} testimonials.`}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRows.map((r) => (
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
          description={
            editing
              ? "Changes apply when you save, or when you close the panel (latest values are written)."
              : "Save when ready, or close after editing  a draft is saved if you entered a name and quote."
          }
          onClose={closePanel}
        >
          <div className="mx-auto max-w-3xl space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className={labelCls}>Author name</Label>
                <Input
                  className={field}
                  value={form.author_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className={labelCls}>Sort order</Label>
                <Input
                  type="number"
                  className={field}
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sort_order: Number(e.target.value) || 0,
                    }))
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
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author_role: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label className={labelCls}>Company</Label>
                <Input
                  className={field}
                  value={form.author_company}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, author_company: e.target.value }))
                  }
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
                onChange={(e) =>
                  setForm((f) => ({ ...f, quote: e.target.value }))
                }
              />
            </div>
            <div>
              <Label className={labelCls}>Highlighted quote (HTML)</Label>
              <Textarea
                className={`${field} min-h-[100px] font-mono text-xs`}
                value={form.highlighted_quote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, highlighted_quote: e.target.value }))
                }
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
                onClick={closePanel}
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
