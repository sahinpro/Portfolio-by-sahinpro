import type { FieldErrors, FieldValues } from "react-hook-form";

export type ListedFormError = {
  field: string;
  message: string;
};

/** Human labels for project form field keys (validation summary). */
export const PROJECT_FIELD_LABELS: Record<string, string> = {
  title: "Title",
  description: "Short description",
  image_url: "Featured image",
  screenshot_urls: "Screenshot gallery",
  category: "Category",
  live_url: "Live URL",
  build_kind: "Build type",
  custom_framework: "Framework",
  technologies: "Technologies",
  github_url: "GitHub URL",
  cms_platform: "CMS platform",
  cms_theme_name: "Theme name",
  cms_extensions: "Plugins",
  featured: "Featured",
  status: "Status",
};

export function listFormErrors<T extends FieldValues>(
  errors: FieldErrors<T>,
): ListedFormError[] {
  const out: ListedFormError[] = [];

  const walk = (node: FieldErrors<T>, prefix = ""): void => {
    for (const [key, value] of Object.entries(node)) {
      if (!value || typeof value !== "object") continue;
      const path = prefix ? `${prefix}.${key}` : key;

      if ("message" in value && typeof value.message === "string") {
        out.push({ field: path.split(".")[0] ?? path, message: value.message });
        continue;
      }

      walk(value as FieldErrors<T>, path);
    }
  };

  walk(errors);
  return out;
}
