import type { PublicProjectDetail } from "@/data/projectUiMapper";

export function bodyParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function frameworkLabel(
  fw: PublicProjectDetail["customFramework"],
  customLabel: string | null,
): string {
  if (fw === "other" && customLabel?.trim()) return customLabel.trim();
  if (fw === "react_vanilla") return "React (Vanilla)";
  if (fw === "vanilla_js") return "Vanilla JS";
  if (fw === "next") return "Next.js";
  if (fw === "react") return "React";
  if (fw === "vue") return "Vue";
  if (fw === "other") return "Custom stack";
  return "";
}

export function cmsPlatformLabel(p: PublicProjectDetail["cmsPlatform"]): string {
  if (p === "wordpress") return "WordPress";
  if (p === "shopify") return "Shopify";
  if (p === "wix") return "Wix";
  return "";
}

export function projectBuildLabel(project: PublicProjectDetail): string {
  return project.buildKind === "custom"
    ? frameworkLabel(project.customFramework, project.customFrameworkLabel) ||
        "Custom"
    : cmsPlatformLabel(project.cmsPlatform) || "CMS";
}

export function projectCategoryLine(project: PublicProjectDetail): string {
  return `${project.category}${project.year ? ` · ${project.year}` : ""}`;
}
