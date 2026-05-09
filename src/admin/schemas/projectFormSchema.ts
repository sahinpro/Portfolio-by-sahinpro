import { PROJECT_CATEGORIES } from "@/admin/constants/frameworkFieldConfig";
import { z } from "zod";

export const projectFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Short description is required"),
    image_url: z.string(),
    screenshot_urls: z.array(z.string()),
    category: z.enum(PROJECT_CATEGORIES),
    live_url: z.string(),
    build_kind: z.enum(["custom", "cms"]),
    custom_framework: z.enum(["react_vanilla", "next", "vanilla_js", ""]),
    github_url: z.string(),
    technologies: z.array(z.string()),
    cms_platform: z.enum(["wordpress", "shopify", "wix", ""]),
    cms_theme_name: z.string(),
    cms_extensions: z.array(z.string()),
    featured: z.boolean(),
    status: z.enum(["draft", "published", "trash"]),
    sort_order: z.coerce.number().int(),
  })
  .superRefine((data, ctx) => {
    if (data.status === "published" && !data.image_url?.trim()) {
      ctx.addIssue({
        code: "custom",
        message: "Featured image is required when publishing",
        path: ["image_url"],
      });
    }
    if (data.build_kind === "custom") {
      if (!data.custom_framework) {
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
    }
    if (data.build_kind === "cms" && !data.cms_platform) {
      ctx.addIssue({
        code: "custom",
        message: "Select a CMS platform",
        path: ["cms_platform"],
      });
    }
  });

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
