export const PROJECT_CATEGORIES = [
  "Web Development",
  "E-commerce",
  "SaaS Platform",
  "Front-end Web Design",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Stored in `projects.custom_framework` for build_kind = custom */
export const CUSTOM_FRAMEWORK_OPTIONS = [
  { value: "react_vanilla", label: "React (Vanilla)" },
  { value: "next", label: "Next.js" },
  { value: "vanilla_js", label: "Vanilla JS" },
] as const;

export type CustomFrameworkSlug = (typeof CUSTOM_FRAMEWORK_OPTIONS)[number]["value"];

export const CMS_PLATFORM_OPTIONS = [
  { value: "wordpress", label: "WordPress" },
  { value: "shopify", label: "Shopify" },
  { value: "wix", label: "Wix" },
] as const;

export type CmsPlatformSlug = (typeof CMS_PLATFORM_OPTIONS)[number]["value"];
