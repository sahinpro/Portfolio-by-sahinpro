import { PROJECT_CATEGORIES } from "@/admin/constants/frameworkFieldConfig";
import type { ProjectFormValues } from "@/admin/schemas/projectFormSchema";
import type { ProjectRow } from "@/admin/types/database";

export function parseStats(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (x): x is { label: string; value: string } =>
        typeof x === "object" &&
        x !== null &&
        "label" in x &&
        "value" in x &&
        typeof (x as { label: unknown }).label === "string" &&
        typeof (x as { value: unknown }).value === "string",
    )
    .map((x) => ({ label: x.label, value: x.value }));
}

function parseExtensions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string");
}

export function parseScreenshotUrls(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function normalizeCategory(cat: string): ProjectFormValues["category"] {
  return (PROJECT_CATEGORIES as readonly string[]).includes(cat)
    ? (cat as ProjectFormValues["category"])
    : "Frontend";
}

export function projectRowToFormValues(row: ProjectRow): ProjectFormValues {
  const stats = parseStats(row.stats);
  const extensions = parseExtensions(row.cms_extensions);
  const screenshots = parseScreenshotUrls(row.screenshot_urls);
  const facets =
    row.custom_stack_facets &&
    typeof row.custom_stack_facets === "object" &&
    !Array.isArray(row.custom_stack_facets)
      ? { ...(row.custom_stack_facets as Record<string, string | string[]>) }
      : {};

  return {
    title: row.title,
    description: row.description ?? "",
    long_description: row.long_description ?? "",
    image_url: row.image_url ?? "",
    screenshot_urls: screenshots,
    technologies: row.technologies ?? [],
    category: normalizeCategory(row.category),
    live_url: row.live_url ?? "",
    github_url: row.github_url ?? "",
    featured: row.featured,
    status: row.status,
    year: row.year ?? "",
    sort_order: row.sort_order,
    stats: stats.length ? stats : [{ label: "", value: "" }],
    build_kind: row.build_kind,
    custom_framework: (row.custom_framework ?? "") as ProjectFormValues["custom_framework"],
    custom_framework_label: row.custom_framework_label ?? "",
    custom_stack_facets: facets,
    cms_platform: (row.cms_platform ?? "") as ProjectFormValues["cms_platform"],
    cms_theme_name: row.cms_theme_name ?? "",
    cms_extensions: extensions.length ? extensions : [""],
  };
}

export function formValuesToProjectPayload(
  values: ProjectFormValues,
): Omit<ProjectRow, "id" | "created_at" | "updated_at"> {
  const statsClean = values.stats.filter((s) => s.label.trim() && s.value.trim());
  const techClean = values.technologies.map((t) => t.trim()).filter(Boolean);
  const extClean = values.cms_extensions.map((e) => e.trim()).filter(Boolean);
  const screenshotClean = values.screenshot_urls.map((u) => u.trim()).filter(Boolean);

  const base = {
    title: values.title.trim(),
    description: values.description.trim() || null,
    long_description: values.long_description.trim() || null,
    image_url: values.image_url.trim() || null,
    screenshot_urls: screenshotClean,
    technologies: techClean,
    category: values.category,
    live_url: values.live_url.trim() || null,
    github_url: values.github_url.trim() || null,
    featured: values.featured,
    status: values.status,
    year: values.year.trim() || null,
    sort_order: values.sort_order,
    stats: statsClean,
  };

  if (values.build_kind === "custom") {
    return {
      ...base,
      build_kind: "custom" as const,
      custom_framework:
        values.custom_framework && values.custom_framework !== ""
          ? (values.custom_framework as "react" | "next" | "vue" | "other")
          : null,
      custom_framework_label:
        values.custom_framework === "other"
          ? values.custom_framework_label.trim() || null
          : null,
      custom_stack_facets:
        values.custom_framework &&
        values.custom_framework !== "" &&
        values.custom_framework !== "other"
          ? values.custom_stack_facets
          : null,
      cms_platform: null,
      cms_theme_name: null,
      cms_extensions: null,
    };
  }

  return {
    ...base,
    build_kind: "cms" as const,
    custom_framework: null,
    custom_framework_label: null,
    custom_stack_facets: null,
    cms_platform: values.cms_platform as "wordpress" | "shopify",
    cms_theme_name: values.cms_theme_name.trim(),
    cms_extensions: extClean,
  };
}

export function defaultEmptyProjectForm(): ProjectFormValues {
  return {
    title: "",
    description: "",
    long_description: "",
    image_url: "",
    screenshot_urls: [],
    technologies: [],
    category: "Frontend",
    live_url: "",
    github_url: "",
    featured: false,
    status: "draft",
    year: new Date().getFullYear().toString(),
    sort_order: 0,
    stats: [{ label: "", value: "" }],
    build_kind: "custom",
    custom_framework: "react",
    custom_framework_label: "",
    custom_stack_facets: {},
    cms_platform: "",
    cms_theme_name: "",
    cms_extensions: [""],
  };
}
