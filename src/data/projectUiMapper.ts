import { FRAMEWORK_FIELD_CONFIG } from "@/admin/constants/frameworkFieldConfig";
import { parseScreenshotUrls, parseStats } from "@/admin/lib/projectMappers";
import type { ProjectRow } from "@/admin/types/database";
import { PROJECT_IMAGE_PLACEHOLDER } from "@/constants/placeholders";

/** Shape used by `ProjectsPage` cards (public site). */
export type PublicProject = {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  year?: string;
  stats?: { label: string; value: string }[];
};

/** Extra fields for the project detail page (build / CMS metadata). */
export type PublicProjectDetail = PublicProject & {
  screenshots: string[];
  buildKind: "custom" | "cms";
  customFramework: "react" | "next" | "vue" | "other" | null;
  customFrameworkLabel: string | null;
  stackDetails: { label: string; value: string }[];
  cmsPlatform: "wordpress" | "shopify" | null;
  cmsThemeName: string | null;
  cmsExtensions: string[];
};

function parseCmsExtensions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function resolveStackDetails(
  framework: "react" | "next" | "vue" | "other" | null,
  facets: Record<string, string | string[]> | null,
): { label: string; value: string }[] {
  if (!framework || framework === "other" || !facets) return [];
  const defs = FRAMEWORK_FIELD_CONFIG[framework as "react" | "next" | "vue"];
  if (!defs) return [];
  const out: { label: string; value: string }[] = [];
  for (const field of defs) {
    const v = facets[field.key];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
    const display = Array.isArray(v)
      ? v
          .map((val) => field.options.find((o) => o.value === val)?.label ?? val)
          .join(", ")
      : field.options.find((o) => o.value === v)?.label ?? v;
    out.push({ label: field.label, value: display });
  }
  return out;
}

export function mapProjectRowToPublic(row: ProjectRow): PublicProject {
  const stats = parseStats(row.stats);
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? "",
    longDescription: row.long_description ?? undefined,
    image: row.image_url?.trim() ? row.image_url : PROJECT_IMAGE_PLACEHOLDER,
    technologies: row.technologies ?? [],
    category: row.category || "Frontend",
    liveUrl: row.live_url,
    githubUrl: row.github_url,
    featured: row.featured,
    year: row.year ?? undefined,
    stats: stats.length ? stats : undefined,
  };
}

export function mapProjectRowToPublicDetail(row: ProjectRow): PublicProjectDetail {
  const base = mapProjectRowToPublic(row);
  const facets =
    row.custom_stack_facets &&
    typeof row.custom_stack_facets === "object" &&
    !Array.isArray(row.custom_stack_facets)
      ? (row.custom_stack_facets as Record<string, string | string[]>)
      : null;
  const fw = row.custom_framework ?? null;
  const stackDetails =
    row.build_kind === "custom" && fw && fw !== "other"
      ? resolveStackDetails(fw, facets)
      : [];

  const shots = parseScreenshotUrls(row.screenshot_urls);

  return {
    ...base,
    screenshots: shots,
    buildKind: row.build_kind,
    customFramework: fw,
    customFrameworkLabel: row.custom_framework_label ?? null,
    stackDetails,
    cmsPlatform: row.cms_platform ?? null,
    cmsThemeName: row.cms_theme_name?.trim() ? row.cms_theme_name : null,
    cmsExtensions: row.build_kind === "cms" ? parseCmsExtensions(row.cms_extensions) : [],
  };
}
