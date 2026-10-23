import type {
  LeadSource,
  OutreachStatus,
  WebsiteStatus,
} from "@/admin/constants/leadOptions";

/**
 * A single potential-client lead. Stored ONLY in the browser's IndexedDB
 * (object store `leads`, keyed by `id`). Never sent to a server.
 *
 * Dates are ISO `YYYY-MM-DD` strings ("" when unset). Timestamps are full ISO
 * date-times. All optional text fields use "" rather than null to keep the form,
 * backup JSON, and IndexedDB records consistent.
 *
 * The form edits only the simplified core fields. Everything marked
 * "(legacy)" is preserved as-is on existing records (IDs, timestamps, counts,
 * old notes) and is no longer editable or displayed in the primary UI.
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
  contactPerson: string; // (legacy) read-only, preserved on edit
  email: string;
  phone: string;
  instagramUrl: string;
  facebookUrl: string; // (legacy) still used for duplicate detection
  preferredContactMethod: string; // (legacy) stored as plain string now

  // Outreach tracking
  outreachStatus: OutreachStatus;
  firstContactDate: string; // (legacy) auto-managed, not in the form
  lastContactDate: string; // (legacy) auto-managed via "Log contact"
  followUpDate: string;
  followUpCount: number; // (legacy) auto-managed via "Log contact"
  firstMessage: string; // (legacy)
  lastConversation: string; // (legacy)

  // Qualification (all legacy — preserved on existing records only)
  priority: string;
  opportunity: string;
  improvements: string;
  estBudget: string;
  expectedValue: string;
  notes: string;

  // Project tracking (legacy — preserved on existing records only)
  projectStatus: string;

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
