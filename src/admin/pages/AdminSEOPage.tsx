import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { CharCounter } from "@/admin/components/ui/CharCounter";
import { TagInput } from "@/admin/components/ui/TagInput";
import { useToast } from "@/admin/context/ToastContext";
import type { SeoSettingsRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

const PAGES = ["/", "/about", "/projects", "/services", "/contact", "/blogs"] as const;

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

export function AdminSEOPage(): JSX.Element {
  const { showToast } = useToast();
  const [tab, setTab] = useState<(typeof PAGES)[number]>("/");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [kw, setKw] = useState<string[]>([]);

  const load = useCallback(async (page: string) => {
    setLoading(true);
    const { data, error } = await supabase.from("seo_settings").select("*").eq("page", page).single();
    setLoading(false);
    if (error && error.code !== "PGRST116") {
      showToast(error.message, "error");
      return;
    }
    const r = data as SeoSettingsRow | null;
    setMetaTitle(r?.meta_title ?? "");
    setMetaDesc(r?.meta_description ?? "");
    setOgImage(r?.og_image ?? "");
    setKw(
      r?.keywords
        ? r.keywords.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
    );
  }, [showToast]);

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  const ogPathPrefix =
    tab === "/"
      ? "seo/home"
      : `seo/${tab.replace(/^\//, "").replace(/\//g, "_")}`;

  const save = async () => {
    setSaving(true);
    const payload = {
      page: tab,
      meta_title: metaTitle.trim() || null,
      meta_description: metaDesc.trim() || null,
      og_image: ogImage.trim() || null,
      keywords: kw.length ? kw.join(", ") : null,
    };
    const { error } = await supabase.from("seo_settings").upsert(payload, { onConflict: "page" });
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    showToast("SEO saved");
    void load(tab);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-2">SEO</h1>
      <p className="text-sm text-white/45 mb-6">Per-route meta for the public site.</p>

      <div className="flex flex-wrap gap-1 mb-6 rounded-lg border border-white/10 p-1 bg-white/[0.02]">
        {PAGES.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setTab(p)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              tab === p ? "bg-white/15 text-white" : "text-white/45 hover:text-white/70"
            }`}
          >
            {p === "/" ? "Home" : p}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-white/45 text-sm">Loading…</p>
      ) : (
        <div className="rounded-xl border border-white/[0.08] bg-[#111] p-5 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>Meta title</label>
              <CharCounter value={metaTitle} max={60} />
            </div>
            <Input className={field} value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>Meta description</label>
              <CharCounter value={metaDesc} max={160} />
            </div>
            <Textarea
              className={`${field} min-h-[100px]`}
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
            />
          </div>
          <ImageUrlField
            label="Open Graph image"
            value={ogImage}
            onChange={setOgImage}
            bucket="portfolio-assets"
            pathPrefix={ogPathPrefix}
            placeholder="Or paste OG image URL"
          />
          <div>
            <label className={labelCls}>Keywords</label>
            <TagInput value={kw} onChange={setKw} />
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4 text-xs text-white/50">
            <p className="font-medium text-white/70 mb-2">Preview</p>
            <div className="flex gap-3">
              <img
                src="/logo.svg"
                alt=""
                width={40}
                height={40}
                className="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover border border-white/[0.08] bg-black/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-blue-400 truncate">{metaTitle || "Title"}</p>
                <p className="text-emerald-600/90 truncate text-[11px] mt-0.5">
                  {typeof window !== "undefined" ? window.location.host : "yoursite.com"}
                  {tab}
                </p>
                <p className="text-white/60 mt-2 line-clamp-2">{metaDesc || "Description preview…"}</p>
              </div>
            </div>
          </div>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save SEO"}
          </button>
        </div>
      )}
    </div>
  );
}
