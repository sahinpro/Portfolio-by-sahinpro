import type {
  CmsPlatformSlug,
  CustomFrameworkSlug,
  ProjectCategory,
} from "@/admin/constants/frameworkFieldConfig";

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

export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
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

export type TestimonialRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  author_company: string | null;
  author_avatar: string | null;
  quote: string;
  highlighted_quote: string | null;
  status: "draft" | "published";
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type SocialLinkRow = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  visible: boolean;
  sort_order: number;
};

export type SeoSettingsRow = {
  page: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  keywords: string | null;
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
