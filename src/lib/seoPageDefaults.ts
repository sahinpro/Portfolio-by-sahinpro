import { DEFAULT_OG_IMAGE_PATH } from "@/constants/site";
import { DEFAULT_KEYWORDS, DEFAULT_META_DESCRIPTION, DEFAULT_META_TITLE } from "@/lib/seoDefaults";

export const SEO_ADMIN_PAGES = [
  "/",
  "/about",
  "/projects",
  "/services",
  "/contact",
] as const;

export type SeoAdminPage = (typeof SEO_ADMIN_PAGES)[number];

export type SeoPageDefaults = {
  meta_title: string;
  meta_description: string;
  og_image: string;
  keywords: string;
};

/** Recommended SEO values per route (used for admin placeholders + reset). */
export const SEO_PAGE_DEFAULTS: Record<SeoAdminPage, SeoPageDefaults> = {
  "/": {
    meta_title: DEFAULT_META_TITLE,
    meta_description: DEFAULT_META_DESCRIPTION,
    og_image: DEFAULT_OG_IMAGE_PATH,
    keywords: DEFAULT_KEYWORDS,
  },
  "/about": {
    meta_title: `About ${DEFAULT_META_TITLE.split(" - ")[0]} | Full Stack Developer`,
    meta_description:
      "Learn about Sahin Alam — Full Stack Developer from Bangladesh. Experience with React, Next.js, WordPress, WooCommerce, and Shopify for agencies and founders worldwide.",
    og_image: DEFAULT_OG_IMAGE_PATH,
    keywords: "Sahin Alam, About, Full Stack Developer, React, Next.js, WordPress",
  },
  "/projects": {
    meta_title: "Projects | Sahin Alam — Portfolio Work",
    meta_description:
      "Selected client projects: WordPress stores, WooCommerce, Shopify, React and Next.js apps. E-commerce, CMS, and custom web development.",
    og_image: DEFAULT_OG_IMAGE_PATH,
    keywords: "Portfolio, Projects, Web Development, React, Next.js, WordPress, WooCommerce",
  },
  "/services": {
    meta_title: "Services | Sahin Alam — Web Development",
    meta_description:
      "Full stack web development services: React & Next.js apps, WordPress & WooCommerce stores, Shopify, performance, SEO, and ongoing support.",
    og_image: DEFAULT_OG_IMAGE_PATH,
    keywords: "Web Development Services, React, Next.js, WordPress, WooCommerce, Shopify",
  },
  "/contact": {
    meta_title: "Contact | Sahin Alam — Hire a Full Stack Developer",
    meta_description:
      "Get in touch with Sahin Alam for your next website or web app. Available for freelance and agency projects worldwide.",
    og_image: DEFAULT_OG_IMAGE_PATH,
    keywords: "Contact, Hire Developer, Full Stack Developer, Freelance Web Developer",
  },
};

/** Legacy OG paths / hosts that should not be used anymore. */
export const STALE_OG_IMAGE_PATHS = new Set([
  "/sahin.png",
  "/sahin.webp",
  "/sahin-avatar.webp",
  "/logo.svg",
]);

export const STALE_OG_IMAGE_SUFFIXES = [
  "/sahin.png",
  "/sahin.webp",
  "/sahin-avatar.webp",
  "/logo.svg",
] as const;

export const STALE_OG_HOSTS = ["sahinalam.com", "www.sahinalam.com"] as const;
