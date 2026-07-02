export const PROJECT_CATEGORIES = [
  "Web Development",
  "E-commerce",
  "SaaS Platform",
  "Front-end Web Design",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

/** Form categories that persist as legacy `Full Stack` in the DB. */
export const FULL_STACK_FORM_CATEGORIES = [
  "Web Development",
  "SaaS Platform",
] as const satisfies readonly ProjectCategory[];

export function isFullStackFormCategory(
  category: ProjectCategory,
): boolean {
  return (FULL_STACK_FORM_CATEGORIES as readonly string[]).includes(category);
}

export function categoriesForBuildKind(
  buildKind: "custom" | "cms",
): readonly ProjectCategory[] {
  if (buildKind === "cms") {
    return PROJECT_CATEGORIES.filter((c) => !isFullStackFormCategory(c));
  }
  return FULL_STACK_FORM_CATEGORIES;
}

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
