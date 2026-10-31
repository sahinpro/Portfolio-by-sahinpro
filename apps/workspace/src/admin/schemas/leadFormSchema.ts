import { isHttpUrl } from "@/admin/lib/leads/normalize";
import { z } from "zod";

export const WEBSITE_STATUS_VALUES = [
  "no_website",
  "has_website",
  "needs_improvement",
  "unknown",
] as const;

export const LEAD_SOURCE_VALUES = [
  "google_maps",
  "instagram",
  "facebook",
  "linkedin",
  "business_directory",
  "referral",
  "other",
] as const;

export const OUTREACH_STATUS_VALUES = [
  "not_contacted",
  "message_sent",
  "awaiting_reply",
  "replied",
  "interested",
  "not_interested",
  "no_response",
  "do_not_contact",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Empty allowed; otherwise must parse as an http(s) URL. Trimming happens in the mapper layer. */
const optionalUrl = (message: string) =>
  z.string().refine((v) => v.trim() === "" || isHttpUrl(v), message);

const optionalEmail = z
  .string()
  .refine((v) => v.trim() === "" || EMAIL_RE.test(v.trim()), "Enter a valid email address");

const optionalDate = (message: string) =>
  z.string().refine((v) => v.trim() === "" || DATE_RE.test(v.trim()), message);

/**
 * Simplified fields edited in the Add / Edit Lead form.
 * Legacy fields (priority, project status, contact dates, message history,
 * budgets…) are no longer part of the form — they are preserved untouched on
 * existing IndexedDB records via the mapper layer.
 */
export const leadFormSchema = z
  .object({
    // A. Business information
    businessName: z.string().min(1, "Business name is required"),
    niche: z.string().min(1, "Niche is required"),
    country: z.string(),
    city: z.string(),
    websiteUrl: optionalUrl("Enter a valid website URL"),
    websiteStatus: z
      .enum(WEBSITE_STATUS_VALUES)
      .refine((v) => Boolean(v), "Select a website status"),
    leadSource: z
      .enum(LEAD_SOURCE_VALUES)
      .or(z.literal(""))
      .refine((v) => v !== "", "Select a lead source"),

    // B. Contact information (all optional)
    email: optionalEmail,
    phone: z.string(),
    instagramUrl: optionalUrl("Enter a valid Instagram profile URL"),

    // C. Outreach & notes
    outreachStatus: z
      .enum(OUTREACH_STATUS_VALUES)
      .refine((v) => Boolean(v), "Select an outreach status"),
    followUpDate: optionalDate("Use a valid date"),
    notes: z.string(),
  })
  .superRefine((data, ctx) => {
    // A URL only makes sense when the business actually has a website.
    if (data.websiteStatus === "no_website") {
      if (data.websiteUrl.trim() !== "") {
        ctx.addIssue({
          code: "custom",
          message: "Remove the website URL — this lead is marked “No Website”",
          path: ["websiteUrl"],
        });
      }
      return;
    }
    if (
      (data.websiteStatus === "has_website" ||
        data.websiteStatus === "needs_improvement") &&
      data.websiteUrl.trim() === ""
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Website URL is required when the business has a website",
        path: ["websiteUrl"],
      });
    }
  });

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Pre-transform form state type (selects can be untouched "" before validation). */
export type LeadFormInput = z.input<typeof leadFormSchema>;

/**
 * Full stored lead record — used to validate imported backup JSON.
 * Intentionally unchanged: old backups (with legacy fields) and new, simplified
 * exports must both round-trip without losing any stored data.
 */
export const leadRecordSchema = z.object({
  id: z.string().min(1),
  businessName: z.string().min(1, "businessName is required"),
  niche: z.string().default(""),
  country: z.string().default(""),
  city: z.string().default(""),
  websiteUrl: z.string().default(""),
  websiteStatus: z.enum(WEBSITE_STATUS_VALUES).default("unknown"),
  leadSource: z.enum(LEAD_SOURCE_VALUES).or(z.literal("")).default(""),
  contactPerson: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  instagramUrl: z.string().default(""),
  facebookUrl: z.string().default(""),
  preferredContactMethod: z.string().default(""),
  outreachStatus: z.enum(OUTREACH_STATUS_VALUES).default("not_contacted"),
  firstContactDate: z.string().default(""),
  lastContactDate: z.string().default(""),
  followUpDate: z.string().default(""),
  followUpCount: z.number().int().min(0).default(0),
  firstMessage: z.string().default(""),
  lastConversation: z.string().default(""),
  priority: z.string().default("medium"),
  opportunity: z.string().default(""),
  improvements: z.string().default(""),
  estBudget: z.string().default(""),
  expectedValue: z.string().default(""),
  notes: z.string().default(""),
  projectStatus: z.string().default("not_qualified"),
  normalizedKey: z.string().default(""),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});
