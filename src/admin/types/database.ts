export type ProjectRow = {
  id: string;
  title: string;
  description: string | null;
  long_description: string | null;
  image_url: string | null;
  technologies: string[];
  category: string;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  status: "draft" | "published";
  year: string | null;
  sort_order: number;
  stats: unknown;
  build_kind: "custom" | "cms";
  custom_framework: "react" | "next" | "vue" | "other" | null;
  custom_framework_label: string | null;
  custom_stack_facets: Record<string, string | string[]> | null;
  cms_platform: "wordpress" | "shopify" | null;
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

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  tags: string[];
  status: "draft" | "published";
  featured: boolean;
  reading_time: number | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ContactSubmissionRow = {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  budget: string | null;
  message: string;
  status: "unread" | "read" | "replied" | "archived";
  created_at: string;
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
