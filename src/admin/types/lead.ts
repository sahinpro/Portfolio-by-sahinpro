import type {
  LeadPriority,
  LeadProjectStatus,
  LeadSource,
  OutreachStatus,
  PreferredContactMethod,
  WebsiteStatus,
} from "@/admin/constants/leadOptions";

/**
 * A single potential-client lead. Stored ONLY in the browser's IndexedDB
 * (object store `leads`, keyed by `id`). Never sent to a server.
 *
 * Dates are ISO `YYYY-MM-DD` strings ("" when unset). Timestamps are full ISO
 * date-times. All optional text fields use "" rather than null to keep the form,
 * backup JSON, and IndexedDB records consistent.
 */
export type Lead = {
  id: string;

  // Business information
  businessName: string;
  niche: string;
  country: string;
  city: string;
  websiteUrl: string;
  websiteStatus: WebsiteStatus;
  leadSource: LeadSource | "";

  // Contact information (all optional)
  contactPerson: string;
  email: string;
  phone: string;
  instagramUrl: string;
  facebookUrl: string;
  preferredContactMethod: PreferredContactMethod | "";

  // Outreach tracking
  outreachStatus: OutreachStatus;
  firstContactDate: string;
  lastContactDate: string;
  followUpDate: string;
  followUpCount: number;
  firstMessage: string;
  lastConversation: string;

  // Qualification
  priority: LeadPriority;
  opportunity: string;
  improvements: string;
  estBudget: string;
  expectedValue: string;
  notes: string;

  // Project tracking (independent from outreachStatus)
  projectStatus: LeadProjectStatus;

  // Identity used for local duplicate detection
  normalizedKey: string;

  createdAt: string;
  updatedAt: string;
};

/** Envelope used for JSON backups (export / import). */
export type LeadBackupFile = {
  app: "portfolio-admin-lead-crm";
  version: 1;
  exportedAt: string;
  count: number;
  leads: Lead[];
};
