import {
  buildNormalizedKey,
  createLeadId,
  normalizeEmail,
  normalizeUrl,
} from "@/admin/lib/leads/normalize";
import type { LeadFormValues } from "@/admin/schemas/leadFormSchema";
import type { Lead } from "@/admin/types/lead";

/** Sensible defaults for a brand-new lead. */
export function defaultEmptyLeadForm(): LeadFormValues {
  return {
    businessName: "",
    niche: "",
    country: "",
    city: "",
    websiteUrl: "",
    websiteStatus: "unknown",
    leadSource: "",

    contactPerson: "",
    email: "",
    phone: "",
    instagramUrl: "",
    facebookUrl: "",
    preferredContactMethod: "",

    outreachStatus: "not_contacted",
    firstContactDate: "",
    lastContactDate: "",
    followUpDate: "",
    firstMessage: "",
    lastConversation: "",

    priority: "medium",
    opportunity: "",
    improvements: "",
    estBudget: "",
    expectedValue: "",
    notes: "",

    projectStatus: "not_qualified",
  };
}

export function leadToFormValues(lead: Lead): LeadFormValues {
  return {
    businessName: lead.businessName ?? "",
    niche: lead.niche ?? "",
    country: lead.country ?? "",
    city: lead.city ?? "",
    websiteUrl: lead.websiteUrl ?? "",
    websiteStatus: lead.websiteStatus ?? "unknown",
    leadSource: lead.leadSource ?? "",

    contactPerson: lead.contactPerson ?? "",
    email: lead.email ?? "",
    phone: lead.phone ?? "",
    instagramUrl: lead.instagramUrl ?? "",
    facebookUrl: lead.facebookUrl ?? "",
    preferredContactMethod: lead.preferredContactMethod ?? "",

    outreachStatus: lead.outreachStatus ?? "not_contacted",
    firstContactDate: lead.firstContactDate ?? "",
    lastContactDate: lead.lastContactDate ?? "",
    followUpDate: lead.followUpDate ?? "",
    firstMessage: lead.firstMessage ?? "",
    lastConversation: lead.lastConversation ?? "",

    priority: lead.priority ?? "medium",
    opportunity: lead.opportunity ?? "",
    improvements: lead.improvements ?? "",
    estBudget: lead.estBudget ?? "",
    expectedValue: lead.expectedValue ?? "",
    notes: lead.notes ?? "",

    projectStatus: lead.projectStatus ?? "not_qualified",
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Build a persisted {@link Lead} from validated form values.
 * - New lead (no `existing`): generates an id + createdAt, followUpCount 0.
 * - Edit: preserves id, createdAt and followUpCount (managed via quick actions).
 */
export function formValuesToLead(
  values: LeadFormValues,
  existing?: Lead | null,
): Lead {
  const normalized = {
    websiteUrl: normalizeUrl(values.websiteUrl),
    instagramUrl: normalizeUrl(values.instagramUrl),
    facebookUrl: normalizeUrl(values.facebookUrl),
    email: normalizeEmail(values.email),
  };

  const createdAt = existing?.createdAt ?? nowIso();
  const followUpCount = existing?.followUpCount ?? 0;

  return {
    id: existing?.id ?? createLeadId(),
    businessName: values.businessName.trim(),
    niche: values.niche.trim(),
    country: values.country.trim(),
    city: values.city.trim(),
    websiteUrl: normalized.websiteUrl,
    websiteStatus: values.websiteStatus,
    leadSource: values.leadSource,

    contactPerson: values.contactPerson.trim(),
    email: normalized.email,
    phone: values.phone.trim(),
    instagramUrl: normalized.instagramUrl,
    facebookUrl: normalized.facebookUrl,
    preferredContactMethod: values.preferredContactMethod,

    outreachStatus: values.outreachStatus,
    firstContactDate: values.firstContactDate,
    lastContactDate: values.lastContactDate,
    followUpDate: values.followUpDate,
    followUpCount,
    firstMessage: values.firstMessage.trim(),
    lastConversation: values.lastConversation.trim(),

    priority: values.priority,
    opportunity: values.opportunity.trim(),
    improvements: values.improvements.trim(),
    estBudget: values.estBudget.trim(),
    expectedValue: values.expectedValue.trim(),
    notes: values.notes.trim(),

    projectStatus: values.projectStatus,

    normalizedKey: buildNormalizedKey(normalized),

    createdAt,
    updatedAt: nowIso(),
  };
}
