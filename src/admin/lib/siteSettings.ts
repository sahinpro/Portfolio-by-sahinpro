import { supabase } from "@/utils/supabase";

export async function getSiteSettingsMap(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw error;
  return Object.fromEntries((data ?? []).map((row) => [row.key, row.value ?? ""]));
}

export async function upsertSiteSettings(entries: Record<string, string>): Promise<void> {
  const updates = Object.entries(entries).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from("site_settings").upsert(updates, { onConflict: "key" });
  if (error) throw error;
}
