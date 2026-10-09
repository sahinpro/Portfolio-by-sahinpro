"use client";

import { ComingSoonDisplay } from "@/components/comingSoon/ComingSoonDisplay";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import { getSiteSettingsMap, upsertSiteSettings } from "@/admin/lib/siteSettings";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import {
  COMING_SOON_BADGE_KEY,
  COMING_SOON_MESSAGE_KEY,
  COMING_SOON_MODE_KEY,
  COMING_SOON_NOTE_KEY,
  COMING_SOON_PROGRESS_KEY,
  COMING_SOON_PROGRESS_LABEL_KEY,
  COMING_SOON_TITLE_KEY,
  DEFAULT_COMING_SOON_BADGE,
  DEFAULT_COMING_SOON_MESSAGE,
  DEFAULT_COMING_SOON_NOTE,
  DEFAULT_COMING_SOON_PROGRESS_LABEL,
  DEFAULT_COMING_SOON_TITLE,
} from "@/lib/siteMode";
import { cn } from "@/lib/utils";
import { MonitorSmartphone, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

type SettingsTab = "coming-soon" | "site";

export function AdminSiteSettingsPage(): JSX.Element {
  const { showToast } = useToast();
  const [tab, setTab] = useState<SettingsTab>("coming-soon");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState(true);
  const [copyrightYear, setCopyrightYear] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDescription, setHeroDescription] = useState("");
  const [typewriterJson, setTypewriterJson] = useState("[]");
  const [comingSoonMode, setComingSoonMode] = useState(false);
  const [comingSoonBadge, setComingSoonBadge] = useState("");
  const [comingSoonTitle, setComingSoonTitle] = useState("");
  const [comingSoonMessage, setComingSoonMessage] = useState("");
  const [comingSoonNote, setComingSoonNote] = useState("");
  const [comingSoonProgress, setComingSoonProgress] = useState("78");
  const [comingSoonProgressLabel, setComingSoonProgressLabel] = useState("");

  const progressValue = useMemo(
    () => Math.max(0, Math.min(100, Math.round(Number(comingSoonProgress) || 0))),
    [comingSoonProgress],
  );

  const previewContent = useMemo(
    () => ({
      badge: comingSoonBadge.trim() || DEFAULT_COMING_SOON_BADGE,
      title: comingSoonTitle.trim() || DEFAULT_COMING_SOON_TITLE,
      message: comingSoonMessage.trim() || DEFAULT_COMING_SOON_MESSAGE,
      note: comingSoonNote.trim() || DEFAULT_COMING_SOON_NOTE,
      progress: progressValue,
      progressLabel: comingSoonProgressLabel.trim() || DEFAULT_COMING_SOON_PROGRESS_LABEL,
    }),
    [
      comingSoonBadge,
      comingSoonTitle,
      comingSoonMessage,
      comingSoonNote,
      comingSoonProgressLabel,
      progressValue,
    ],
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const map = await getSiteSettingsMap();
      setAvailability(map.availability_status !== "unavailable");
      setCopyrightYear(map.copyright_year ?? "");
      setHeroTitle(map.hero_title ?? "");
      setHeroDescription(map.hero_description ?? "");
      setTypewriterJson(map.hero_typewriter_words ?? "[]");
      setComingSoonMode(map[COMING_SOON_MODE_KEY] === "enabled");
      setComingSoonBadge(map[COMING_SOON_BADGE_KEY] ?? "");
      setComingSoonTitle(map[COMING_SOON_TITLE_KEY] ?? "");
      setComingSoonMessage(map[COMING_SOON_MESSAGE_KEY] ?? "");
      setComingSoonNote(map[COMING_SOON_NOTE_KEY] ?? "");
      setComingSoonProgress(map[COMING_SOON_PROGRESS_KEY] ?? "78");
      setComingSoonProgressLabel(map[COMING_SOON_PROGRESS_LABEL_KEY] ?? "");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    let parsed: string[] = [];
    try {
      const j = JSON.parse(typewriterJson);
      if (!Array.isArray(j) || !j.every((x) => typeof x === "string"))
        throw new Error();
      parsed = j;
    } catch {
      showToast("Typewriter words must be a JSON array of strings", "error");
      return;
    }
    setSaving(true);
    try {
      await upsertSiteSettings({
        availability_status: availability ? "available" : "unavailable",
        copyright_year: copyrightYear.trim() || String(new Date().getFullYear()),
        hero_title: heroTitle.trim(),
        hero_description: heroDescription.trim(),
        hero_typewriter_words: JSON.stringify(parsed),
        [COMING_SOON_MODE_KEY]: comingSoonMode ? "enabled" : "disabled",
        [COMING_SOON_BADGE_KEY]: comingSoonBadge.trim(),
        [COMING_SOON_TITLE_KEY]: comingSoonTitle.trim(),
        [COMING_SOON_MESSAGE_KEY]: comingSoonMessage.trim(),
        [COMING_SOON_NOTE_KEY]: comingSoonNote.trim(),
        [COMING_SOON_PROGRESS_KEY]: String(progressValue),
        [COMING_SOON_PROGRESS_LABEL_KEY]: comingSoonProgressLabel.trim(),
      });
      invalidatePublicDataCache();
      showToast("Settings saved");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-white/45 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-6xl space-y-6 pb-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Site settings</h1>
          <p className="text-sm text-white/45 mt-1">
            Manage coming soon mode, maintenance page copy, and hero content.
          </p>
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            type="button"
            onClick={() => setTab("coming-soon")}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              tab === "coming-soon"
                ? "bg-white text-black"
                : "text-white/55 hover:text-white",
            )}
          >
            Coming soon
          </button>
          <button
            type="button"
            onClick={() => setTab("site")}
            className={cn(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
              tab === "site"
                ? "bg-white text-black"
                : "text-white/55 hover:text-white",
            )}
          >
            Hero & site
          </button>
        </div>
      </div>

      {tab === "coming-soon" ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_16px_50px_rgba(0,0,0,0.18)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                    <MonitorSmartphone className="h-4.5 w-4.5 text-cyan-200" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Coming soon mode</p>
                    <p className="mt-1 text-sm leading-6 text-white/45">
                      {comingSoonMode
                        ? "Public visitors see the maintenance page instead of the live site."
                        : "The live portfolio is visible to everyone."}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold",
                      comingSoonMode
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                        : "border-zinc-700 bg-zinc-800/70 text-zinc-300",
                    )}
                  >
                    {comingSoonMode ? "Active" : "Live"}
                  </span>
                  <ToggleSwitch
                    checked={comingSoonMode}
                    onChange={setComingSoonMode}
                    label={comingSoonMode ? "Coming soon enabled" : "Website live"}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-white">Page content</h2>
                <p className="mt-1 text-sm text-white/45">
                  Copy shown on the public maintenance screen while coming soon is active.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Badge text</label>
                  <Input
                    className={field}
                    value={comingSoonBadge}
                    onChange={(e) => setComingSoonBadge(e.target.value)}
                    placeholder={DEFAULT_COMING_SOON_BADGE}
                  />
                </div>
                <div>
                  <label className={labelCls}>Headline</label>
                  <Input
                    className={field}
                    value={comingSoonTitle}
                    onChange={(e) => setComingSoonTitle(e.target.value)}
                    placeholder={DEFAULT_COMING_SOON_TITLE}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Main message</label>
                <Textarea
                  className={`${field} min-h-[110px]`}
                  value={comingSoonMessage}
                  onChange={(e) => setComingSoonMessage(e.target.value)}
                  placeholder={DEFAULT_COMING_SOON_MESSAGE}
                />
              </div>
              <div>
                <label className={labelCls}>Supporting note</label>
                <Textarea
                  className={`${field} min-h-[90px]`}
                  value={comingSoonNote}
                  onChange={(e) => setComingSoonNote(e.target.value)}
                  placeholder={DEFAULT_COMING_SOON_NOTE}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelCls}>Progress percentage</label>
                  <Input
                    className={field}
                    inputMode="numeric"
                    value={comingSoonProgress}
                    onChange={(e) => setComingSoonProgress(e.target.value)}
                    placeholder="78"
                  />
                </div>
                <div>
                  <label className={labelCls}>Progress label</label>
                  <Input
                    className={field}
                    value={comingSoonProgressLabel}
                    onChange={(e) => setComingSoonProgressLabel(e.target.value)}
                    placeholder={DEFAULT_COMING_SOON_PROGRESS_LABEL}
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="xl:sticky xl:top-8 xl:self-start space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">
              <Sparkles className="h-3.5 w-3.5" />
              Live preview
            </div>
            <div className="overflow-hidden rounded-[1.75rem] border border-white/[0.08] shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
              <ComingSoonDisplay variant="preview" {...previewContent} />
            </div>
            <p className="text-xs leading-5 text-white/40">
              Preview matches the public coming soon page. Signed-in admins can still browse the
              live site when mode is active.
            </p>
          </aside>
        </div>
      ) : (
        <section className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 space-y-5 max-w-2xl">
          <div>
            <h2 className="text-sm font-semibold text-white">Hero & global content</h2>
            <p className="mt-1 text-sm text-white/45">
              Homepage hero copy and footer copyright year.
            </p>
          </div>
          <ToggleSwitch
            checked={availability}
            onChange={setAvailability}
            label="Available for work (hero badge)"
          />
          <div>
            <label className={labelCls}>Copyright year</label>
            <Input
              className={field}
              value={copyrightYear}
              onChange={(e) => setCopyrightYear(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Hero title</label>
            <Input
              className={field}
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Hero description</label>
            <Textarea
              className={`${field} min-h-[80px]`}
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Typewriter words (JSON array)</label>
            <Textarea
              className={`${field} min-h-[120px] font-mono text-xs`}
              value={typewriterJson}
              onChange={(e) => setTypewriterJson(e.target.value)}
            />
          </div>
        </section>
      )}

      <div
        className="fixed bottom-0 left-0 right-0 z-20 border-t border-white/[0.08] bg-zinc-950/95 px-4 py-3 backdrop-blur-md
          lg:left-[17.5rem]"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <p className="hidden text-sm text-white/40 sm:block">
            {tab === "coming-soon"
              ? comingSoonMode
                ? "Coming soon mode is active for public visitors."
                : "Live site is visible to public visitors."
              : "Hero and availability settings apply to the live homepage."}
          </p>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="ml-auto rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
