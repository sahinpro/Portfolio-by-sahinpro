import { z } from "zod";
import { PROJECT_CATEGORIES } from "@/admin/constants/frameworkFieldConfig";

const statSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

export const projectFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Short description is required"),
    long_description: z.string(),
    image_url: z.string(),
    screenshot_urls: z.array(z.string().min(1)),
    technologies: z.array(z.string()),
    category: z.enum(PROJECT_CATEGORIES),
    live_url: z.string(),
    github_url: z.string(),
    featured: z.boolean(),
    status: z.enum(["draft", "published"]),
    year: z.string(),
    sort_order: z.coerce.number().int(),
    stats: z.array(statSchema),
    build_kind: z.enum(["custom", "cms"]),
    custom_framework: z.enum(["react", "next", "vue", "other", ""]),
    custom_framework_label: z.string(),
    custom_stack_facets: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
    cms_platform: z.enum(["wordpress", "shopify", ""]),
    cms_theme_name: z.string(),
    cms_extensions: z.array(z.string()),
  })
  .superRefine((data, ctx) => {
    if (data.build_kind === "custom") {
      if (!data.custom_framework || data.custom_framework === "") {
        ctx.addIssue({
          code: "custom",
          message: "Select a framework",
          path: ["custom_framework"],
        });
      }
      if (data.custom_framework === "other" && !data.custom_framework_label.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Name your stack",
          path: ["custom_framework_label"],
        });
      }
    }
    if (data.build_kind === "cms") {
      if (!data.cms_platform) {
        ctx.addIssue({
          code: "custom",
          message: "Select WordPress or Shopify",
          path: ["cms_platform"],
        });
      }
      if (!data.cms_theme_name.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "Theme name is required",
          path: ["cms_theme_name"],
        });
      }
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
