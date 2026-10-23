/** Enum option values, labels and badge styling for the Lead CRM. */

export type WebsiteStatus =
  | "no_website"
  | "has_website"
  | "needs_improvement"
  | "unknown";

export type LeadSource =
  | "google_maps"
  | "instagram"
  | "facebook"
  | "linkedin"
  | "business_directory"
  | "referral"
  | "email"
  | "other";

export type PreferredContactMethod =
  | "instagram_dm"
  | "email"
  | "whatsapp"
  | "phone"
  | "facebook"
  | "other";

export type OutreachStatus =
  | "not_contacted"
  | "message_sent"
  | "awaiting_reply"
  | "replied"
  | "interested"
  | "not_interested"
  | "no_response"
  | "do_not_contact";

export type LeadPriority = "low" | "medium" | "high";

export type LeadProjectStatus =
  | "not_qualified"
  | "qualified"
  | "proposal_sent"
  | "negotiation"
  | "won"
  | "lost"
  | "not_a_fit";

export type Option<T extends string> = { value: T; label: string };

export const WEBSITE_STATUS_OPTIONS: Option<WebsiteStatus>[] = [
  { value: "no_website", label: "No Website" },
  { value: "has_website", label: "Has Website" },
  { value: "needs_improvement", label: "Needs Improvement" },
  { value: "unknown", label: "Unknown" },
];

export const LEAD_SOURCE_OPTIONS: Option<LeadSource>[] = [
  { value: "google_maps", label: "Google Maps" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "business_directory", label: "Business Directory" },
  { value: "referral", label: "Referral" },
  { value: "email", label: "Email" },
  { value: "other", label: "Other" },
];

export const PREFERRED_CONTACT_OPTIONS: Option<PreferredContactMethod>[] = [
  { value: "instagram_dm", label: "Instagram DM" },
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "phone", label: "Phone" },
  { value: "facebook", label: "Facebook" },
  { value: "other", label: "Other" },
];

export const OUTREACH_STATUS_OPTIONS: Option<OutreachStatus>[] = [
  { value: "not_contacted", label: "Not Contacted" },
  { value: "message_sent", label: "Message Sent" },
  { value: "awaiting_reply", label: "Awaiting Reply" },
  { value: "replied", label: "Replied" },
  { value: "interested", label: "Interested" },
  { value: "not_interested", label: "Not Interested" },
  { value: "no_response", label: "No Response" },
  { value: "do_not_contact", label: "Do Not Contact" },
];

export const PRIORITY_OPTIONS: Option<LeadPriority>[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

export const PROJECT_STATUS_OPTIONS: Option<LeadProjectStatus>[] = [
  { value: "not_qualified", label: "Not Qualified" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal_sent", label: "Proposal Sent" },
  { value: "negotiation", label: "Negotiation" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "not_a_fit", label: "Not a Fit" },
];

/** Badge color classes consistent with the existing dark admin design system. */
const OUTREACH_BADGE: Record<OutreachStatus, string> = {
  not_contacted: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  message_sent: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  awaiting_reply: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  replied: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  interested: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  not_interested: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  no_response: "bg-orange-500/15 text-orange-300 border-orange-500/25",
  do_not_contact: "bg-red-500/20 text-red-300 border-red-500/30",
};

const PROJECT_BADGE: Record<LeadProjectStatus, string> = {
  not_qualified: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  qualified: "bg-sky-500/15 text-sky-300 border-sky-500/25",
  proposal_sent: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  negotiation: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  won: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  lost: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  not_a_fit: "bg-zinc-600/25 text-zinc-400 border-zinc-600/30",
};

const PRIORITY_BADGE: Record<LeadPriority, string> = {
  low: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  medium: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  high: "bg-red-500/15 text-red-300 border-red-500/25",
};

const WEBSITE_BADGE: Record<WebsiteStatus, string> = {
  no_website: "bg-red-500/15 text-red-300 border-red-500/25",
  has_website: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  needs_improvement: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  unknown: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
};

const FALLBACK_BADGE = "bg-white/10 text-white/60 border-white/15";

export function labelFor<T extends string>(
  options: Option<T>[],
  value: T | "" | null | undefined,
): string {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label ?? value;
}

export function outreachBadgeClass(status: OutreachStatus): string {
  return OUTREACH_BADGE[status] ?? FALLBACK_BADGE;
}

export function projectBadgeClass(status: LeadProjectStatus): string {
  return PROJECT_BADGE[status] ?? FALLBACK_BADGE;
}

export function priorityBadgeClass(priority: LeadPriority): string {
  return PRIORITY_BADGE[priority] ?? FALLBACK_BADGE;
}

export function websiteBadgeClass(status: WebsiteStatus): string {
  return WEBSITE_BADGE[status] ?? FALLBACK_BADGE;
}
