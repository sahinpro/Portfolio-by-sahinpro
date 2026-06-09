import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

if (!isSupabaseConfigured && typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.error(
    "[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or key. " +
      "Add them to .env.local, then restart the dev server (npm run dev).",
  );
}

export const supabase = createClient(
  supabaseUrl || "https://invalid.supabase.co",
  supabaseKey || "invalid-key",
);
