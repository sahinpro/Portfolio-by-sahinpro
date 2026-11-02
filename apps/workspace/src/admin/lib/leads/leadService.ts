import type { Lead } from "@/admin/types/lead";

/** Local, in-memory logic over the IndexedDB lead collection. */

export type FollowUpBucket = "overdue" | "today" | "upcoming" | "none";

export type LeadSortKey =
  | "businessName"
  | "followUpDate"
  | "outreachStatus"
  | "createdAt"
  | "updatedAt";

export type SortDir = "asc" | "desc";

export type LeadFilterState = {
  search: string;
  niche: string;
  country: string;
  leadSource: string;
  websiteStatus: string;
  outreachStatus: string;
  followUp: "" | FollowUpBucket;
};

export const EMPTY_FILTERS: LeadFilterState = {
  search: "",
  niche: "",
  country: "",
  leadSource: "",
  websiteStatus: "",
  outreachStatus: "",
  followUp: "",
};

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDaysIso(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

/** Classify a `YYYY-MM-DD` follow-up date relative to today. */
export function classifyFollowUp(
  date: string | null | undefined,
): FollowUpBucket {
  if (!date) return "none";
  const today = todayIso();
  if (date < today) return "overdue";
  if (date === today) return "today";
  return "upcoming";
}

function matchesSearch(lead: Lead, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return [
    lead.businessName,
    lead.niche,
    lead.city,
    lead.country,
    lead.email,
    lead.phone,
  ].some((value) => (value ?? "").toLowerCase().includes(needle));
}

export function applyFilters(leads: Lead[], filters: LeadFilterState): Lead[] {
  const q = filters.search.trim();
  return leads.filter((lead) => {
    if (!matchesSearch(lead, q)) return false;
    if (filters.niche && lead.niche !== filters.niche) return false;
    if (filters.country && lead.country !== filters.country) return false;
    if (filters.leadSource && lead.leadSource !== filters.leadSource)
      return false;
    if (filters.websiteStatus && lead.websiteStatus !== filters.websiteStatus)
      return false;
    if (
      filters.outreachStatus &&
      lead.outreachStatus !== filters.outreachStatus
    )
      return false;
    if (filters.followUp) {
      if (filters.followUp === "none") {
        if (lead.followUpDate) return false;
      } else if (classifyFollowUp(lead.followUpDate) !== filters.followUp) {
        return false;
      }
    }
    return true;
  });
}

export function sortLeads(
  leads: Lead[],
  key: LeadSortKey,
  dir: SortDir,
): Lead[] {
  const factor = dir === "asc" ? 1 : -1;
  const copy = [...leads];

  copy.sort((a, b) => {
    if (
      key === "followUpDate" ||
      key === "createdAt" ||
      key === "updatedAt"
    ) {
      const av = a[key] ?? "";
      const bv = b[key] ?? "";
      // Records without a date always sink to the bottom.
      if (!av && !bv) return 0;
      if (!av) return 1;
      if (!bv) return -1;
      return av.localeCompare(bv) * factor;
    }

    const av = String(a[key] ?? "").toLowerCase();
    const bv = String(b[key] ?? "").toLowerCase();
    return av.localeCompare(bv) * factor;
  });

  return copy;
}

export type LeadSummary = {
  total: number;
  notContacted: number;
  awaitingReply: number;
  interested: number;
  followUpsDue: number;
};

export function computeSummary(leads: Lead[]): LeadSummary {
  let notContacted = 0;
  let awaitingReply = 0;
  let interested = 0;
  let followUpsDue = 0;

  for (const lead of leads) {
    if (lead.outreachStatus === "not_contacted") notContacted += 1;
    if (lead.outreachStatus === "awaiting_reply") awaitingReply += 1;
    if (lead.outreachStatus === "interested") interested += 1;
    const bucket = classifyFollowUp(lead.followUpDate);
    if (bucket === "overdue" || bucket === "today") followUpsDue += 1;
  }

  return {
    total: leads.length,
    notContacted,
    awaitingReply,
    interested,
    followUpsDue,
  };
}

/** Local duplicate detection by normalized identity key (never by name alone). */
export function findDuplicates(
  leads: Lead[],
  normalizedKey: string,
  exceptId?: string,
): Lead[] {
  if (!normalizedKey) return [];
  return leads.filter(
    (lead) => lead.normalizedKey === normalizedKey && lead.id !== exceptId,
  );
}

function distinct(values: string[]): string[] {
  return [...new Set(values.map((v) => v.trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b),
  );
}

export function getNicheFacets(leads: Lead[]): string[] {
  return distinct(leads.map((lead) => lead.niche));
}

export function getCountryFacets(leads: Lead[]): string[] {
  return distinct(leads.map((lead) => lead.country));
}

export function hasActiveFilters(filters: LeadFilterState): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.niche !== "" ||
    filters.country !== "" ||
    filters.leadSource !== "" ||
    filters.websiteStatus !== "" ||
    filters.outreachStatus !== "" ||
    filters.followUp !== ""
  );
}
