import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

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

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("site_settings").select("key, value");
    setLoading(false);
    if (error) {
      showToast(error.message, "error");
      return;
    }
    const map = Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
    setAvailability(map.availability_status !== "unavailable");
    setCopyrightYear(map.copyright_year ?? "");
    setHeroTitle(map.hero_title ?? "");
    setHeroDescription(map.hero_description ?? "");
    setTypewriterJson(map.hero_typewriter_words ?? "[]");
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    let parsed: string[] = [];
    try {
      const j = JSON.parse(typewriterJson);
      if (!Array.isArray(j) || !j.every((x) => typeof x === "string")) throw new Error();
      parsed = j;
    } catch {
      showToast("Typewriter words must be a JSON array of strings", "error");
      return;
    }
    setSaving(true);
    const updates = [
      { key: "availability_status", value: availability ? "available" : "unavailable" },
      { key: "copyright_year", value: copyrightYear.trim() || String(new Date().getFullYear()) },
      { key: "hero_title", value: heroTitle.trim() },
      { key: "hero_description", value: heroDescription.trim() },
      { key: "hero_typewriter_words", value: JSON.stringify(parsed) },
    ];
    for (const u of updates) {
      const { error } = await supabase.from("site_settings").upsert(u, { onConflict: "key" });
      if (error) {
        showToast(error.message, "error");
        setSaving(false);
        return;
      }
    }
    setSaving(false);
    showToast("Settings saved");
  };

  if (loading) {
    return <p className="text-white/45 text-sm">Loading…</p>;
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Site settings</h1>
        <p className="text-sm text-white/45 mt-1">Hero copy and global keys.</p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] p-5 space-y-5">
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
        <button
          type="button"
          disabled={saving}
          onClick={() => void save()}
          className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
