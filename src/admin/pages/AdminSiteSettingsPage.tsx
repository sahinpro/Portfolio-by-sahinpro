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
} from "@/lib/siteMode";
import { useCallback, useEffect, useMemo, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

export function AdminSiteSettingsPage(): JSX.Element {
  const { showToast } = useToast();
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
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Site settings</h1>
        <p className="text-sm text-white/45 mt-1">Global site content and coming soon controls.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-white/[0.08] bg-[#111] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Coming soon mode</p>
                <p className="mt-1 text-sm text-white/45">
                  {comingSoonMode
                    ? "Public visitors currently see the coming soon page."
                    : "Public visitors currently see the live website."}
                </p>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                    comingSoonMode
                      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                      : "border-zinc-700 bg-zinc-800/70 text-zinc-300"
                  }`}
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
              <h2 className="text-sm font-semibold text-white">Coming soon content</h2>
              <p className="mt-1 text-sm text-white/45">Everything users see while the site is hidden.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Badge text</label>
                <Input className={field} value={comingSoonBadge} onChange={(e) => setComingSoonBadge(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Main title</label>
                <Input className={field} value={comingSoonTitle} onChange={(e) => setComingSoonTitle(e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Main message</label>
              <Textarea className={`${field} min-h-[110px]`} value={comingSoonMessage} onChange={(e) => setComingSoonMessage(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Supporting note</label>
              <Textarea className={`${field} min-h-[90px]`} value={comingSoonNote} onChange={(e) => setComingSoonNote(e.target.value)} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Progress percentage</label>
                <Input className={field} value={comingSoonProgress} onChange={(e) => setComingSoonProgress(e.target.value)} placeholder="78" />
              </div>
              <div>
                <label className={labelCls}>Progress label</label>
                <Input className={field} value={comingSoonProgressLabel} onChange={(e) => setComingSoonProgressLabel(e.target.value)} placeholder="Launch progress" />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#111] p-5 space-y-5">
            <div>
              <h2 className="text-sm font-semibold text-white">General site settings</h2>
              <p className="mt-1 text-sm text-white/45">Hero copy and global keys.</p>
            </div>
            <div>
              <ToggleSwitch
                checked={availability}
                onChange={setAvailability}
                label="Available for work (hero badge)"
              />
            </div>
            <div>
              <label className={labelCls}>Copyright year</label>
              <Input className={field} value={copyrightYear} onChange={(e) => setCopyrightYear(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Hero title</label>
              <Input className={field} value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Hero description</label>
              <Textarea className={`${field} min-h-[80px]`} value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Typewriter words (JSON array)</label>
              <Textarea className={`${field} min-h-[120px] font-mono text-xs`} value={typewriterJson} onChange={(e) => setTypewriterJson(e.target.value)} />
            </div>
            <button
              type="button"
              disabled={saving}
              onClick={() => void save()}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save settings"}
            </button>
          </section>
        </div>

        <aside className="rounded-[2rem] border border-white/[0.08] bg-black p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/80">Live preview</p>
          <div className="mt-8 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.55em] text-white/85">
              {comingSoonBadge || "Coming Soon"}
            </p>
            <h3 className="mt-10 text-3xl font-semibold uppercase tracking-[0.3em] text-white">Coming Soon</h3>
            <h4 className="mt-6 text-2xl font-semibold leading-tight text-white/95">
              {comingSoonTitle || "A refined experience is on the way"}
            </h4>
            <p className="mt-4 text-sm leading-7 text-white/70">
              {comingSoonMessage ||
                "The site is temporarily unavailable while we prepare a more polished launch. Please check back shortly."}
            </p>
            <div className="mx-auto mt-8 w-full max-w-xs">
              <div className="mb-3 flex items-center justify-between text-[10px] uppercase tracking-[0.35em] text-white/60">
                <span>{comingSoonProgressLabel || "Launch progress"}</span>
                <span>{progressValue}%</span>
              </div>
              <div className="h-4 rounded-full border border-fuchsia-400/70 bg-transparent p-[3px]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-400 via-violet-400 to-fuchsia-500"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              <p className="mt-3 text-xs uppercase tracking-[0.35em] text-white/75">
                {comingSoonMode ? "In progress" : "Live website"}
              </p>
            </div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">
            {comingSoonNote ||
              "We are currently making focused improvements behind the scenes to deliver a cleaner, faster, and more complete experience."}
          </div>
        </aside>
      </div>
    </div>
  );
}
