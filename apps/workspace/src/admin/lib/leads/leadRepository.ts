import { leadRowsToLeads, leadToRow } from "@/admin/lib/leads/leadRowMapper";
import type { LeadRow } from "@sahinpro/shared/types/database";
import type { Lead } from "@/admin/types/lead";
import { isSupabaseConfigured, supabase } from "@sahinpro/shared/supabase";

/**
 * Supabase-backed leads repository.
 *
 * Reuses the app's single existing client (`@sahinpro/shared/supabase`, public/anon key +
 * the admin's session) exactly like the projects / testimonials / resume admin
 * screens. Authorization happens in Postgres through RLS + the `admin_emails`
 * allowlist — the service-role key is never used here or anywhere client-side.
 */

const TABLE = "leads";
const UPSERT_CHUNK = 100;

/** Why a read/write failed, so the UI can show a fixable message. */
export type LeadAccessState =
  | "ok"
  | "unconfigured"
  | "missing-table"
  | "signed-out"
  | "not-authorised"
  | "offline"
  | "unknown";

export class LeadStoreError extends Error {
  readonly state: LeadAccessState;

  constructor(state: LeadAccessState, message: string) {
    super(message);
    this.name = "LeadStoreError";
    this.state = state;
  }
}

export const LEAD_STORE_MESSAGES: Record<LeadAccessState, string> = {
  ok: "",
  unconfigured:
    "Supabase is not configured for this deployment, so cloud leads are unavailable. Add NEXT_PUBLIC_SUPABASE_URL and the public key, then restart.",
  "missing-table":
    "The leads table does not exist yet. Run supabase/migrations/20261023120000_leads_table.sql in the Supabase SQL editor.",
  "signed-out": "Your admin session expired. Sign in again to load leads.",
  "not-authorised":
    "Your account is not on the leads allowlist. Add its email to public.admin_emails in Supabase (see the migration file).",
  offline:
    "Could not reach Supabase. Check your connection — nothing was lost, try again.",
  unknown: "The leads request failed. Try again.",
};

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message ?? "");
  }
  return String(error ?? "");
}

function codeOf(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const e = error as { code?: unknown; statusCode?: unknown };
    return `${String(e.code ?? "")} ${String(e.statusCode ?? "")}`;
  }
  return "";
}

/** Turn any Supabase/PostgREST failure into a LeadStoreError with a state. */
export function toLeadStoreError(error: unknown): LeadStoreError {
  if (error instanceof LeadStoreError) return error;
  const code = codeOf(error);
  const message = messageOf(error);
  const lower = message.toLowerCase();

  if (code.includes("PGRST205") || lower.includes("could not find the table")) {
    return new LeadStoreError("missing-table", LEAD_STORE_MESSAGES["missing-table"]);
  }
  if (code.includes("42P01") || lower.includes('relation "leads"')) {
    return new LeadStoreError("missing-table", LEAD_STORE_MESSAGES["missing-table"]);
  }
  // JWT rejected / expired, or PostgREST could not read it at all.
  if (
    code.includes("PGRST301") ||
    code.includes("PGRST303") ||
    lower.includes("jwt expired") ||
    lower.includes("invalid json") ||
    lower.includes("no token")
  ) {
    return new LeadStoreError("signed-out", LEAD_STORE_MESSAGES["signed-out"]);
  }
  // RLS refused a row for a role that does hold the table grants: a signed-in
  // account that is not on the admin_emails allowlist.
  if (lower.includes("row-level security") || code.includes("PGRST403")) {
    return new LeadStoreError(
      "not-authorised",
      LEAD_STORE_MESSAGES["not-authorised"],
    );
  }
  // Missing object privileges. The migration grants leads to `authenticated`,
  // so this only happens when the request arrives as `anon` — no usable session.
  if (code.includes("42501") || lower.includes("permission denied")) {
    return new LeadStoreError("signed-out", LEAD_STORE_MESSAGES["signed-out"]);
  }
  if (
    lower.includes("failed to fetch") ||
    lower.includes("networkerror") ||
    lower.includes("intentionally") ||
    lower.includes("timed out")
  ) {
    return new LeadStoreError("offline", LEAD_STORE_MESSAGES.offline);
  }
  return new LeadStoreError(
    "unknown",
    message ? `${LEAD_STORE_MESSAGES.unknown} (${message})` : LEAD_STORE_MESSAGES.unknown,
  );
}

function ensureConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new LeadStoreError(
      "unconfigured",
      LEAD_STORE_MESSAGES.unconfigured,
    );
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** Every lead the current admin may see, newest-updated first. */
export async function listLeads(): Promise<Lead[]> {
  ensureConfigured();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw toLeadStoreError(error);
  return leadRowsToLeads((data ?? []) as LeadRow[]);
}

export async function getLead(id: string): Promise<Lead | undefined> {
  ensureConfigured();
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw toLeadStoreError(error);
  return data ? leadRowsToLeads([data as LeadRow])[0] : undefined;
}

/** Insert or update one lead (keyed by id). */
export async function putLead(lead: Lead): Promise<void> {
  ensureConfigured();
  const { error } = await supabase
    .from(TABLE)
    .upsert(leadToRow(lead), { onConflict: "id" });
  if (error) throw toLeadStoreError(error);
}

/** Insert or update many leads in batches. Returns how many were sent. */
export async function upsertLeads(leads: Lead[]): Promise<number> {
  ensureConfigured();
  let sent = 0;
  for (const group of chunk(leads, UPSERT_CHUNK)) {
    const { error } = await supabase
      .from(TABLE)
      .upsert(group.map(leadToRow), { onConflict: "id" });
    if (error) throw toLeadStoreError(error);
    sent += group.length;
  }
  return sent;
}

export async function deleteLead(id: string): Promise<void> {
  ensureConfigured();
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw toLeadStoreError(error);
}

/** Remove every lead this admin can see (used by the "replace all" import). */
export async function deleteAllLeads(): Promise<void> {
  ensureConfigured();
  // `not(id, is, null)` matches every row while still being an explicit filter.
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .not("id", "is", null);
  if (error) throw toLeadStoreError(error);
}

/** Ids currently stored in the cloud — used to verify an upload. */
export async function listLeadIds(): Promise<string[]> {
  ensureConfigured();
  const { data, error } = await supabase.from(TABLE).select("id");
  if (error) throw toLeadStoreError(error);
  return (data ?? []).map((row: { id: string }) => row.id);
}

/**
 * Is the signed-in account allowed to use the leads table?
 * Returns the same states the read path would produce, without needing the
 * table to exist (falls back to probing a read).
 */
export async function checkLeadAccess(): Promise<LeadAccessState> {
  if (!isSupabaseConfigured) return "unconfigured";
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) return "signed-out";

  const { data, error } = await supabase.rpc("is_admin");
  if (error) {
    const state = toLeadStoreError(error).state;
    // Older projects may not expose the function — fall back to a read probe.
    if (state === "missing-table" || state === "unknown") {
      const probe = await supabase.from(TABLE).select("id").limit(1);
      if (probe.error) return toLeadStoreError(probe.error).state;
      return "ok";
    }
    return state;
  }
  return data ? "ok" : "not-authorised";
}
