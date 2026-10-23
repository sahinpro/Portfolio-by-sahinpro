import {
  LEAD_SOURCE_VALUES,
  OUTREACH_STATUS_VALUES,
  WEBSITE_STATUS_VALUES,
  leadRecordSchema,
} from "@/admin/schemas/leadFormSchema";
import type { LeadRow, LeadRowInput } from "@/admin/types/database";
import type { Lead } from "@/admin/types/lead";

/**
 * Mapping between the `leads` table (snake_case, nullable dates) and the app's
 * `Lead` record (camelCase, "" for unset text and dates).
 *
 * Reads go through `leadRecordSchema` so unexpected values in the database
 * (legacy enums, nulls, missing columns) normalise to a valid `Lead` instead of
 * crashing the table. Writes drop empty timestamps so the DB defaults apply.
 */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function text(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}

/** `YYYY-MM-DD` from a date column, or "" when unset / unparseable. */
function dateOnly(value: unknown): string {
  const raw = text(value).trim();
  if (!raw) return "";
  const match = DATE_ONLY.exec(raw);
  if (match) return match[0];
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

/** Full timestamp normalised to UTC ISO so string comparisons stay meaningful. */
function timestamp(value: unknown): string {
  const raw = text(value).trim();
  if (!raw) return "";
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

/** Date column value: `YYYY-MM-DD` or null (never ""). */
function dateOrNull(value: string): string | null {
  return DATE_ONLY.test(value) ? value : null;
}

function count(value: unknown): number {
  const n = typeof value === "number" ? value : Number(text(value));
  return Number.isFinite(n) && n >= 0 ? Math.trunc(n) : 0;
}

/** Keep values the typed form understands; anything else falls back to a safe default. */
function oneOf<T extends readonly string[]>(
  value: string,
  allowed: T,
  // `""` is accepted because `Lead.leadSource` allows an unset source.
  fallback: T[number] | "",
): string {
  return (allowed as readonly string[]).includes(value) ? value : fallback;
}

/** DB row → app record. Unknown / legacy enum values are normalised by the schema. */
export function leadRowToLead(row: Partial<LeadRow>): Lead {
  const candidate = {
    id: text(row.id),
    businessName: text(row.business_name),
    niche: text(row.niche),
    country: text(row.country),
    city: text(row.city),
    websiteUrl: text(row.website_url),
    websiteStatus: oneOf(
      text(row.website_status),
      WEBSITE_STATUS_VALUES,
      "unknown",
    ),
    leadSource: oneOf(text(row.lead_source), LEAD_SOURCE_VALUES, ""),
    contactPerson: text(row.contact_person),
    email: text(row.email),
    phone: text(row.phone),
    instagramUrl: text(row.instagram_url),
    facebookUrl: text(row.facebook_url),
    preferredContactMethod: text(row.preferred_contact_method),
    outreachStatus: oneOf(
      text(row.outreach_status),
      OUTREACH_STATUS_VALUES,
      "not_contacted",
    ),
    firstContactDate: dateOnly(row.first_contact_date),
    lastContactDate: dateOnly(row.last_contact_date),
    followUpDate: dateOnly(row.follow_up_date),
    followUpCount: count(row.follow_up_count),
    firstMessage: text(row.first_message),
    lastConversation: text(row.last_conversation),
    priority: text(row.priority),
    opportunity: text(row.opportunity),
    improvements: text(row.improvements),
    estBudget: text(row.est_budget),
    expectedValue: text(row.expected_value),
    notes: text(row.notes),
    projectStatus: text(row.project_status),
    normalizedKey: text(row.normalized_key),
    createdAt: timestamp(row.created_at),
    updatedAt: timestamp(row.updated_at),
  };

  const parsed = leadRecordSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;

  // Last resort: keep the row visible (with safe defaults) rather than dropping it.
  return {
    ...leadRecordSchema.parse({
      id: candidate.id || "unknown",
      businessName: candidate.businessName || "Untitled lead",
    }),
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
  };
}

export function leadRowsToLeads(rows: Partial<LeadRow>[] | null): Lead[] {
  return (rows ?? []).map(leadRowToLead);
}

/** App record → upsert payload. */
export function leadToRow(lead: Lead): LeadRowInput {
  const row: LeadRowInput = {
    id: lead.id,
    business_name: lead.businessName,
    niche: lead.niche,
    country: lead.country,
    city: lead.city,
    website_url: lead.websiteUrl,
    website_status: lead.websiteStatus,
    lead_source: lead.leadSource,
    contact_person: lead.contactPerson,
    email: lead.email,
    phone: lead.phone,
    instagram_url: lead.instagramUrl,
    facebook_url: lead.facebookUrl,
    preferred_contact_method: lead.preferredContactMethod,
    outreach_status: lead.outreachStatus,
    first_contact_date: dateOrNull(lead.firstContactDate),
    last_contact_date: dateOrNull(lead.lastContactDate),
    follow_up_date: dateOrNull(lead.followUpDate),
    follow_up_count: count(lead.followUpCount),
    first_message: lead.firstMessage,
    last_conversation: lead.lastConversation,
    priority: lead.priority,
    opportunity: lead.opportunity,
    improvements: lead.improvements,
    est_budget: lead.estBudget,
    expected_value: lead.expectedValue,
    notes: lead.notes,
    project_status: lead.projectStatus,
    normalized_key: lead.normalizedKey,
  };

  // Empty timestamps fall back to the column defaults instead of failing the insert.
  const createdAt = timestamp(lead.createdAt);
  const updatedAt = timestamp(lead.updatedAt);
  if (createdAt) row.created_at = createdAt;
  if (updatedAt) row.updated_at = updatedAt;
  return row;
}
