"use client";

import { ImageUrlField } from "@/admin/components/ui/ImageUrlField";
import { CharCounter } from "@/admin/components/ui/CharCounter";
import { TagInput } from "@/admin/components/ui/TagInput";
import { useToast } from "@/admin/context/ToastContext";
import type { SeoSettingsRow } from "@/admin/types/database";
import { canonicalPath } from "@/constants/site";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import {
  normalizeOgImagePath,
  resolveOgImageUrl,
} from "@/lib/resolveOgImage";
import {
  SEO_ADMIN_PAGES,
  SEO_PAGE_DEFAULTS,
  STALE_OG_IMAGE_PATHS,
  type SeoAdminPage,
} from "@/lib/seoPageDefaults";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useMemo, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

function isStaleOgImage(value: string): boolean {
  const normalized = normalizeOgImagePath(value);
  if (!normalized && value.trim()) return true;
  const path = value.trim().split("?")[0]?.toLowerCase() ?? "";
  return STALE_OG_IMAGE_PATHS.has(path) || /sahinalam\.com/i.test(value);
}

export function AdminSEOPage(): JSX.Element {
  const { showToast } = useToast();
  const [tab, setTab] = useState<SeoAdminPage>("/");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDesc, setMetaDesc] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [kw, setKw] = useState<string[]>([]);

  const pageDefaults = SEO_PAGE_DEFAULTS[tab];
  const canonical = useMemo(() => canonicalPath(tab), [tab]);
  const previewOg = resolveOgImageUrl(ogImage || pageDefaults.og_image);

  const load = useCallback(async (page: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("seo_settings")
      .select("*")
      .eq("page", page)
      .single();
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

  const savePayload = (page: SeoAdminPage, values: {
    meta_title: string;
    meta_description: string;
    og_image: string;
    keywords: string[];
  }) => ({
    page,
    meta_title: values.meta_title.trim() || null,
    meta_description: values.meta_description.trim() || null,
    og_image:
      normalizeOgImagePath(values.og_image) ??
      (values.og_image.trim() || null),
    keywords: values.keywords.length ? values.keywords.join(", ") : null,
  });

  const save = async () => {
    setSaving(true);
    const payload = savePayload(tab, {
      meta_title: metaTitle,
      meta_description: metaDesc,
      og_image: ogImage,
      keywords: kw,
    });
    const { error } = await supabase
      .from("seo_settings")
      .upsert(payload, { onConflict: "page" });
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    showToast("SEO saved");
    void load(tab);
  };

  const applyDefaults = () => {
    setMetaTitle(pageDefaults.meta_title);
    setMetaDesc(pageDefaults.meta_description);
    setOgImage(pageDefaults.og_image);
    setKw(pageDefaults.keywords.split(",").map((s) => s.trim()).filter(Boolean));
  };

  const fixAllPages = async () => {
    setSaving(true);
    const rows = SEO_ADMIN_PAGES.map((page) =>
      savePayload(page, {
        meta_title: SEO_PAGE_DEFAULTS[page].meta_title,
        meta_description: SEO_PAGE_DEFAULTS[page].meta_description,
        og_image: SEO_PAGE_DEFAULTS[page].og_image,
        keywords: SEO_PAGE_DEFAULTS[page].keywords.split(",").map((s) => s.trim()),
      }),
    );
    const { error } = await supabase.from("seo_settings").upsert(rows, {
      onConflict: "page",
    });
    setSaving(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    invalidatePublicDataCache();
    showToast("All pages updated to current site defaults");
    void load(tab);
  };

  const ogStale = isStaleOgImage(ogImage);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-2">SEO</h1>
      <p className="text-sm text-white/45 mb-6">
        Per-route meta for the public site. Canonical URL and locale are set automatically in code.
      </p>

      <div className="flex flex-wrap gap-1 mb-6 rounded-lg border border-white/10 p-1 bg-white/[0.02]">
        {SEO_ADMIN_PAGES.map((p) => (
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
          <div className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5 text-xs text-zinc-400 space-y-1">
            <p>
              <span className="text-zinc-500">Canonical:</span>{" "}
              <span className="text-emerald-400/90 break-all">{canonical}</span>
            </p>
            <p>
              <span className="text-zinc-500">Locale:</span>{" "}
              <span className="text-white/80">en_US</span> (automatic)
            </p>
            <p>
              <span className="text-zinc-500">Default OG image:</span>{" "}
              <span className="text-white/80">{pageDefaults.og_image}</span>
            </p>
          </div>

          {ogStale ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/90">
              This OG image path looks outdated (e.g. <code className="text-amber-200">/sahin.png</code> or an old domain).
              Use <strong>/sahin.jpg</strong> or click &quot;Use recommended defaults&quot;.
            </div>
          ) : null}

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className={labelCls}>Meta title</label>
              <CharCounter value={metaTitle} max={60} />
            </div>
            <Input
              className={field}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder={pageDefaults.meta_title}
            />
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
              placeholder={pageDefaults.meta_description}
            />
          </div>
          <ImageUrlField
            label="Open Graph image"
            value={ogImage}
            onChange={setOgImage}
            bucket="portfolio-assets"
            pathPrefix={ogPathPrefix}
            placeholder={pageDefaults.og_image}
          />
          <div>
            <label className={labelCls}>Keywords</label>
            <TagInput value={kw} onChange={setKw} />
          </div>
          <div className="rounded-lg border border-white/[0.06] bg-black/20 p-4 text-xs text-white/50">
            <p className="font-medium text-white/70 mb-2">Search preview</p>
            <div className="flex gap-3">
              <img
                src={previewOg}
                alt=""
                width={40}
                height={40}
                className="mt-0.5 h-10 w-10 shrink-0 rounded-lg object-cover border border-white/[0.08] bg-black/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-blue-400 truncate">{metaTitle || pageDefaults.meta_title}</p>
                <p className="text-emerald-600/90 truncate text-[11px] mt-0.5">
                  sahin.pro.bd{tab === "/" ? "" : tab}
                </p>
                <p className="text-white/60 mt-2 line-clamp-2">
                  {metaDesc || pageDefaults.meta_description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save SEO"}
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={applyDefaults}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06] disabled:opacity-50"
            >
              Use recommended defaults
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => setOgImage(pageDefaults.og_image)}
              className="rounded-lg border border-white/15 px-4 py-2.5 text-sm font-medium text-white/85 hover:bg-white/[0.06] disabled:opacity-50"
            >
              Set OG to /sahin.jpg
            </button>
          </div>

          <div className="border-t border-white/[0.06] pt-4">
            <p className="text-xs text-white/45 mb-2">
              Bulk fix: overwrite SEO for every public page with current recommended values (fixes stale{" "}
              <code className="text-white/60">/sahin.png</code> and old domains).
            </p>
            <button
              type="button"
              disabled={saving}
              onClick={() => void fixAllPages()}
              className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-100 hover:bg-cyan-500/15 disabled:opacity-50"
            >
              Fix all pages (recommended defaults)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
