import type {
  CmsPlatformSlug,
  CustomFrameworkSlug,
  ProjectCategory,
} from "../frameworkFields";

/** `projects.build_kind` */
export type ProjectBuildKind = "custom" | "cms";

/** `projects.status` */
export type ProjectStatus = "draft" | "published" | "trash";

/**
 * Values stored in `projects.custom_framework` (DB / legacy CHECK constraints).
 * Form uses {@link CustomFrameworkSlug}; see `formCustomFrameworkToDbStorage` in projectMappers.
 */
export type ProjectCustomFrameworkDbSlug =
  | CustomFrameworkSlug
  | "react"
  | "vue"
  | "other"
  | null;

export type ProjectMetric = {
  label: string;
  value: string;
};

export type ProjectCaseStudy = {
  problem: string;
  solution: string;
  result: string;
};

export type ProjectTestimonial = {
  quote: string;
  client_name: string;
  client_role?: string;
  client_photo?: string;
};

export type TestimonialRow = {
  id: string;
  quote: string;
  client_name: string;
  client_role: string | null;
  client_photo: string | null;
  project_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  /** Short attribution, e.g. sole developer vs independent freelance client. */
  role_label?: string | null;
  /** Optional case-study copy. Empty/null means the public section stays hidden. */
  problem?: string | null;
  solution?: string | null;
  result?: string | null;
  /** `{ label, value }[]`. Empty array means no stat cards. */
  metrics?: ProjectMetric[] | unknown;
  before_image?: string | null;
  after_image?: string | null;
  testimonial_quote?: string | null;
  testimonial_author?: string | null;
  testimonial_role?: string | null;
  case_study?: ProjectCaseStudy | null;
  /**
   * Resolved from `testimonials.project_id` (or legacy JSON) when loading
   * public/admin views — not a column on `projects`.
   */
  testimonial?: ProjectTestimonial | TestimonialRow | null;
  image_url: string | null;
  technologies: string[];
  /** Display label; legacy rows may still use old bucket names until migrated. */
  category: ProjectCategory | string;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  status: ProjectStatus;
  sort_order: number;
  stats: unknown;
  build_kind: ProjectBuildKind;
  custom_framework: ProjectCustomFrameworkDbSlug;
  custom_framework_label: string | null;
  custom_stack_facets: Record<string, string | string[]> | null;
  cms_platform: CmsPlatformSlug | null;
  cms_theme_name: string | null;
  cms_extensions: unknown;
  /** JSON array of public image URLs for the project detail gallery */
  screenshot_urls: unknown;
  created_at: string;
  updated_at: string;
};

export type ResumeRow = {
  id: string;
  file_url: string;
  file_name: string | null;
  uploaded_at: string;
  is_active: boolean;
};

export type PageViewRow = {
  id: number;
  path: string;
  referrer: string | null;
  country: string | null;
  user_agent: string | null;
  visited_at: string;
};

/**
 * `leads` — the Lead CRM table (see
 * `supabase/migrations/20261023120000_leads_table.sql`).
 *
 * Status/enum columns are plain text so records migrated from the browser store
 * keep legacy values instead of being rejected by a CHECK constraint; the app
 * normalises them on read (see `leadRecordSchema`).
 */
export type LeadRow = {
  id: string;
  business_name: string;
  niche: string;
  country: string;
  city: string;
  website_url: string;
  website_status: string;
  lead_source: string;
  contact_person: string;
  email: string;
  phone: string;
  instagram_url: string;
  facebook_url: string;
  preferred_contact_method: string;
  outreach_status: string;
  first_contact_date: string | null;
  last_contact_date: string | null;
  follow_up_date: string | null;
  follow_up_count: number;
  first_message: string;
  last_conversation: string;
  priority: string;
  opportunity: string;
  improvements: string;
  est_budget: string;
  expected_value: string;
  notes: string;
  project_status: string;
  normalized_key: string;
  created_at: string;
  updated_at: string;
};

/** Upsert payload: every column is optional except the identity ones. */
export type LeadRowInput = Partial<LeadRow> &
  Pick<LeadRow, "id" | "business_name">;
