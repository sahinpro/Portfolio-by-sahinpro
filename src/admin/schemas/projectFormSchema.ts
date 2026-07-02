import {
  CMS_PLATFORM_OPTIONS,
  CUSTOM_FRAMEWORK_OPTIONS,
  isFullStackFormCategory,
  PROJECT_CATEGORIES,
} from "@/admin/constants/frameworkFieldConfig";
import {
  hasCmsBuildFieldValues,
  hasCustomBuildFieldValues,
} from "@/admin/lib/buildKindFieldGuards";
import { z } from "zod";

const CUSTOM_FRAMEWORK_SLUGS = CUSTOM_FRAMEWORK_OPTIONS.map((o) => o.value);
const CMS_PLATFORM_SLUGS = CMS_PLATFORM_OPTIONS.map((o) => o.value);

const baseProjectFields = {
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Short description is required"),
  image_url: z.string(),
  screenshot_urls: z.array(z.string()),
  category: z.enum(PROJECT_CATEGORIES),
  live_url: z.string(),
  /** Required: pick Custom code or CMS; branch-specific fields validate separately. */
  build_kind: z.enum(["custom", "cms"]),
  /** Validated only when `build_kind === "custom"` (string avoids enum errors on CMS rows). */
  custom_framework: z.string().nullable().optional(),
  github_url: z.string(),
  technologies: z.array(z.string()),
  /** Validated only when `build_kind === "cms"`. */
  cms_platform: z.string().nullable().optional(),
  cms_theme_name: z.string().nullable().optional(),
  cms_extensions: z.array(z.string().nullable()).optional(),
  featured: z.boolean(),
  status: z.enum(["draft", "published", "trash"]),
  sort_order: z.coerce.number().int(),
};

function refineProjectForm(
  data: z.infer<z.ZodObject<typeof baseProjectFields>>,
  ctx: z.RefinementCtx,
): void {
  if (data.status === "published" && !data.image_url?.trim()) {
    ctx.addIssue({
      code: "custom",
      message: "Featured image is required when publishing",
      path: ["image_url"],
    });
  }
  if (data.status === "trash") return;

  if (data.build_kind === "custom" && hasCmsBuildFieldValues(data)) {
    ctx.addIssue({
      code: "custom",
      message: "Choose either Custom code or CMS — not both",
      path: ["build_kind"],
    });
  }
  if (data.build_kind === "cms" && hasCustomBuildFieldValues(data)) {
    ctx.addIssue({
      code: "custom",
      message: "Choose either Custom code or CMS — not both",
      path: ["build_kind"],
    });
  }

  if (data.build_kind === "custom") {
    const fw = (data.custom_framework ?? "").trim();
    if (!fw) {
      ctx.addIssue({
        code: "custom",
        message: "Select a framework",
        path: ["custom_framework"],
      });
    } else if (!(CUSTOM_FRAMEWORK_SLUGS as readonly string[]).includes(fw)) {
      ctx.addIssue({
        code: "custom",
        message: "Select a framework",
        path: ["custom_framework"],
      });
    }
    const tech = data.technologies.map((t) => t.trim()).filter(Boolean);
    if (tech.length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "Add at least one technology",
        path: ["technologies"],
      });
    }
    if (!isFullStackFormCategory(data.category)) {
      ctx.addIssue({
        code: "custom",
        message: "Custom code projects must be categorized as Full Stack",
        path: ["category"],
      });
    }
    return;
  }

  if (isFullStackFormCategory(data.category)) {
    ctx.addIssue({
      code: "custom",
      message: "CMS projects cannot be categorized as Full Stack",
      path: ["category"],
    });
  }

  const platform = (data.cms_platform ?? "").trim();
  if (!platform) {
    ctx.addIssue({
      code: "custom",
      message: "Select a CMS platform",
      path: ["cms_platform"],
    });
  } else if (!(CMS_PLATFORM_SLUGS as readonly string[]).includes(platform)) {
    ctx.addIssue({
      code: "custom",
      message: "Select a CMS platform",
      path: ["cms_platform"],
    });
  }
}

export const projectFormSchema = z
  .object(baseProjectFields)
  .superRefine(refineProjectForm);

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
