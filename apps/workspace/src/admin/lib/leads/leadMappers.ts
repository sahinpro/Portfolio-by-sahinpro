import {
  buildNormalizedKey,
  createLeadId,
  normalizeEmail,
  normalizeUrl,
} from "@/admin/lib/leads/normalize";
import type {
  LeadFormInput,
  LeadFormValues,
} from "@/admin/schemas/leadFormSchema";
import type { Lead } from "@/admin/types/lead";

/** Sensible defaults for a brand-new lead. */
export function defaultEmptyLeadForm(): LeadFormInput {
  return {
    businessName: "",
    niche: "",
    country: "",
    city: "",
    websiteUrl: "",
    websiteStatus: "unknown",
    leadSource: "",

    email: "",
    phone: "",
    instagramUrl: "",

    outreachStatus: "not_contacted",
    followUpDate: "",
    notes: "",
  };
}

/** Map a stored record (including legacy ones) down to the simplified form. */
export function leadToFormValues(lead: Lead): LeadFormInput {
  return {
    businessName: lead.businessName ?? "",
    niche: lead.niche ?? "",
    country: lead.country ?? "",
    city: lead.city ?? "",
    websiteUrl: lead.websiteStatus === "no_website" ? "" : (lead.websiteUrl ?? ""),
    websiteStatus: lead.websiteStatus ?? "unknown",
    leadSource: lead.leadSource ?? "",

    email: lead.email ?? "",
    phone: lead.phone ?? "",
    instagramUrl: lead.instagramUrl ?? "",

    outreachStatus: lead.outreachStatus ?? "not_contacted",
    followUpDate: lead.followUpDate ?? "",
    notes: lead.notes ?? "",
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Build a persisted {@link Lead} from validated form values.
 * - New lead (no `existing`): generates an id + createdAt, followUpCount 0.
 * - Edit: preserves id, createdAt and every legacy field the simplified form
 *   no longer edits (dates, counts, messages, priority, project status,
 *   contact person, Facebook URL …) so no stored data is ever lost.
 */
export function formValuesToLead(
  values: LeadFormValues,
  existing?: Lead | null,
): Lead {
  const hasWebsite =
    values.websiteStatus === "has_website" ||
    values.websiteStatus === "needs_improvement" ||
    (values.websiteStatus === "unknown" && values.websiteUrl.trim() !== "");

  const normalized = {
    websiteUrl: hasWebsite ? normalizeUrl(values.websiteUrl) : "",
    instagramUrl: normalizeUrl(values.instagramUrl),
    // Facebook URLs are no longer editable, but stay part of the identity key.
    facebookUrl: existing?.facebookUrl ?? "",
    email: normalizeEmail(values.email),
  };

  const createdAt = existing?.createdAt ?? nowIso();

  return {
    id: existing?.id ?? createLeadId(),
    businessName: values.businessName.trim(),
    niche: values.niche.trim(),
    country: values.country.trim(),
    city: values.city.trim(),
    websiteUrl: normalized.websiteUrl,
    websiteStatus: values.websiteStatus,
    leadSource: values.leadSource,

    contactPerson: existing?.contactPerson ?? "",
    email: normalized.email,
    phone: values.phone.trim(),
    instagramUrl: normalized.instagramUrl,
    facebookUrl: existing?.facebookUrl ?? "",
    preferredContactMethod: existing?.preferredContactMethod ?? "",

    outreachStatus: values.outreachStatus,
    firstContactDate: existing?.firstContactDate ?? "",
    lastContactDate: existing?.lastContactDate ?? "",
    followUpDate: values.followUpDate,
    followUpCount: existing?.followUpCount ?? 0,
    firstMessage: existing?.firstMessage ?? "",
    lastConversation: existing?.lastConversation ?? "",

    priority: existing?.priority ?? "medium",
    opportunity: existing?.opportunity ?? "",
    improvements: existing?.improvements ?? "",
    estBudget: existing?.estBudget ?? "",
    expectedValue: existing?.expectedValue ?? "",
    notes: values.notes.trim(),

    projectStatus: existing?.projectStatus ?? "not_qualified",

    normalizedKey: buildNormalizedKey(normalized),

    createdAt,
    updatedAt: nowIso(),
  };
}
