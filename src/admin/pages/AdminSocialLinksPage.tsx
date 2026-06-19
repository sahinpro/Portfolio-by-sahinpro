"use client";

import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import type { SocialLinkRow } from "@/admin/types/database";
import { SocialLinkGlyph } from "@/components/public/socialLinkIcon";
import { Input } from "@/components/ui/input";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import { Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 text-xs text-white outline-none focus:border-white/20";

function formatSocialLinkError(error: { message: string; code?: string }): string {
  if (error.code === "23505") {
    return "That URL is already used by another row. Each social link URL must be unique.";
  }
  return error.message;
}

export function AdminSocialLinksPage(): JSX.Element {
  const { showToast } = useToast();
  const [rows, setRows] = useState<SocialLinkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, Partial<SocialLinkRow>>>({});
  const [savingAll, setSavingAll] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("sort_order", { ascending: true });
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    setRows((data ?? []) as SocialLinkRow[]);
    setDrafts({});
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const d = (id: string): Partial<SocialLinkRow> => drafts[id] ?? {};

  const setD = (id: string, patch: Partial<SocialLinkRow>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const merged = (r: SocialLinkRow): SocialLinkRow => ({ ...r, ...d(r.id) });

  const hasDrafts = Object.keys(drafts).length > 0;
  const isBusy = savingAll || deletingId !== null;

  const saveAll = async () => {
    const dirtyIds = Object.keys(drafts);
    if (dirtyIds.length === 0) {
      showToast("No changes to save", "warning");
      return;
    }

    setSavingAll(true);
    let failed = false;

    for (const id of dirtyIds) {
      const r = rows.find((row) => row.id === id);
      if (!r) continue;

      const m = merged(r);
      const { error } = await supabase
        .from("social_links")
        .update({
          platform: m.platform,
          url: m.url,
          icon: m.icon,
          visible: m.visible,
          sort_order: m.sort_order,
        })
        .eq("id", r.id);

      if (error) {
        showToast(formatSocialLinkError(error), "error");
        failed = true;
        break;
      }
    }

    setSavingAll(false);
    if (failed) return;

    invalidatePublicDataCache();
    showToast(
      dirtyIds.length === 1 ? "Saved 1 link" : `Saved ${dirtyIds.length} links`,
    );
    setDrafts({});
    void load();
  };

  const addRow = async () => {
    const { error } = await supabase.from("social_links").insert({
      platform: "New",
      url: "https://",
      icon: "link",
      visible: true,
      sort_order: rows.length,
    });
    if (error) {
      showToast(formatSocialLinkError(error), "error");
      return;
    }
    invalidatePublicDataCache();
    showToast("Row added");
    void load();
  };

  const deleteRow = async (r: SocialLinkRow) => {
    setDeletingId(r.id);
    const { error } = await supabase.from("social_links").delete().eq("id", r.id);
    setDeletingId(null);
    if (error) {
      showToast(formatSocialLinkError(error), "error");
      return;
    }
    invalidatePublicDataCache();
    showToast("Row deleted");
    setDrafts((prev) => {
      const next = { ...prev };
      delete next[r.id];
      return next;
    });
    void load();
  };

  if (loading) {
    return <p className="text-white/45 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-5xl">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Social links</h1>
          <p className="text-sm text-white/45 mt-1">Footer and hero icons.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!hasDrafts || isBusy}
            onClick={() => void saveAll()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Save className="h-4 w-4" />
            {savingAll ? "Saving…" : "Save all"}
          </button>
          <button
            type="button"
            disabled={isBusy}
            onClick={() => void addRow()}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[640px]">
          <thead>
            <tr className="border-b border-white/[0.08] text-white/40 uppercase tracking-wider">
              <th className="px-3 py-2">Platform</th>
              <th className="px-3 py-2">URL</th>
              <th className="px-3 py-2 min-w-[200px]">Icon / image</th>
              <th className="px-3 py-2">Order</th>
              <th className="px-3 py-2">Visible</th>
              <th className="px-3 py-2 w-12" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const m = merged(r);
              return (
                <tr key={r.id} className="border-b border-white/[0.05]">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white/70">
                        <SocialLinkGlyph link={m} className="h-4 w-4" />
                      </div>
                      <Input
                        className={field}
                        value={m.platform}
                        onChange={(e) => setD(r.id, { platform: e.target.value })}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      className={field}
                      value={m.url}
                      onChange={(e) => setD(r.id, { url: e.target.value })}
                    />
                  </td>
                  <td className="px-3 py-2 align-top">
                    <ImageUrlField
                      variant="compact"
                      value={m.icon ?? ""}
                      onChange={(url) => setD(r.id, { icon: url })}
                      bucket="portfolio-assets"
                      pathPrefix={`social/${r.id}`}
                    />
                  </td>
                  <td className="px-3 py-2 w-20">
                    <Input
                      type="number"
                      className={field}
                      value={m.sort_order}
                      onChange={(e) =>
                        setD(r.id, { sort_order: Number(e.target.value) || 0 })
                      }
                    />
                  </td>
                  <td className="px-3 py-2">
                    <ToggleSwitch
                      checked={m.visible}
                      onChange={(v) => setD(r.id, { visible: v })}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => void deleteRow(r)}
                      className="p-2 rounded-lg text-white/50 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
                      title="Delete row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
