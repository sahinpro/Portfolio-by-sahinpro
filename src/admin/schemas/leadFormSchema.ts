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
  "email",
  "other",
] as const;

export const CONTACT_METHOD_VALUES = [
  "instagram_dm",
  "email",
  "whatsapp",
  "phone",
  "facebook",
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

export const PRIORITY_VALUES = ["low", "medium", "high"] as const;

export const PROJECT_STATUS_VALUES = [
  "not_qualified",
  "qualified",
  "proposal_sent",
  "negotiation",
  "won",
  "lost",
  "not_a_fit",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Empty allowed; otherwise must parse as an http(s) URL. */
const optionalUrl = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || isHttpUrl(v), message);

const optionalEmail = z
  .string()
  .trim()
  .refine((v) => v === "" || EMAIL_RE.test(v), "Enter a valid email address");

const optionalDate = (message: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === "" || DATE_RE.test(v), message);

/** Fields edited in the Add / Lead form. */
export const leadFormSchema = z
  .object({
    businessName: z.string().trim().min(1, "Business name is required"),
    niche: z.string().trim().min(1, "Niche is required"),
    country: z.string().trim(),
    city: z.string().trim(),
    websiteUrl: optionalUrl("Enter a valid website URL"),
    websiteStatus: z.enum(WEBSITE_STATUS_VALUES),
    leadSource: z.enum(LEAD_SOURCE_VALUES).or(z.literal("")),

    contactPerson: z.string().trim(),
    email: optionalEmail,
    phone: z.string().trim(),
    instagramUrl: optionalUrl("Enter a valid Instagram profile URL"),
    facebookUrl: optionalUrl("Enter a valid Facebook page URL"),
    preferredContactMethod: z.enum(CONTACT_METHOD_VALUES).or(z.literal("")),

    outreachStatus: z.enum(OUTREACH_STATUS_VALUES),
    firstContactDate: optionalDate("Use a valid date"),
    lastContactDate: optionalDate("Use a valid date"),
    followUpDate: optionalDate("Use a valid date"),
    firstMessage: z.string(),
    lastConversation: z.string(),

    priority: z.enum(PRIORITY_VALUES),
    opportunity: z.string(),
    improvements: z.string(),
    estBudget: z.string().trim(),
    expectedValue: z.string().trim(),
    notes: z.string(),

    projectStatus: z.enum(PROJECT_STATUS_VALUES),
  })
  .superRefine((data, ctx) => {
    if (
      data.firstContactDate &&
      data.lastContactDate &&
      data.lastContactDate < data.firstContactDate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Last contact date is before the first contact date",
        path: ["lastContactDate"],
      });
    }
  });

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Full stored lead record — used to validate imported backup JSON. */
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
  preferredContactMethod: z
    .enum(CONTACT_METHOD_VALUES)
    .or(z.literal(""))
    .default(""),
  outreachStatus: z.enum(OUTREACH_STATUS_VALUES).default("not_contacted"),
  firstContactDate: z.string().default(""),
  lastContactDate: z.string().default(""),
  followUpDate: z.string().default(""),
  followUpCount: z.number().int().min(0).default(0),
  firstMessage: z.string().default(""),
  lastConversation: z.string().default(""),
  priority: z.enum(PRIORITY_VALUES).default("medium"),
  opportunity: z.string().default(""),
  improvements: z.string().default(""),
  estBudget: z.string().default(""),
  expectedValue: z.string().default(""),
  notes: z.string().default(""),
  projectStatus: z.enum(PROJECT_STATUS_VALUES).default("not_qualified"),
  normalizedKey: z.string().default(""),
  createdAt: z.string().default(""),
  updatedAt: z.string().default(""),
});
