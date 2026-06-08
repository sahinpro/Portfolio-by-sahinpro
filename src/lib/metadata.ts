import type { Metadata } from "next";
import type { SeoSettingsRow } from "@/admin/types/database";
import { PROFILE } from "@/constants/profile";
import { absoluteUrl, canonicalPath, getSiteUrl } from "@/constants/site";
import { mapProjectRowToPublicDetail } from "@/data/projectUiMapper";
import {
  fetchPublishedProjectBySlug,
  fetchSeoForPage,
  fetchSiteSettingsMap,
} from "@/data/publicSupabase.server";
import { isComingSoonEnabled } from "@/lib/siteMode";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
  DEFAULT_OG_IMAGE,
} from "@/lib/seoDefaults";

const SITE = PROFILE.name;

function buildKeywords(row: SeoSettingsRow | null): string {
  return row?.keywords?.trim() || DEFAULT_KEYWORDS;
}

function resolveOgImage(row: SeoSettingsRow | null, fallback?: string): string {
  const custom = row?.og_image?.trim();
  if (custom) return absoluteUrl(custom);
  if (fallback) return absoluteUrl(fallback);
  return DEFAULT_OG_IMAGE;
}

function baseOpenGraph(
  title: string,
  description: string,
  url: string,
  image: string,
  type: "website" | "article" = "website",
): Metadata["openGraph"] {
  return {
    type,
    siteName: SITE,
    locale: "en_US",
    url,
    title,
    description,
    images: [
      {
        url: image,
        alt: `${SITE} — ${PROFILE.role}`,
      },
    ],
  };
}

function baseTwitter(
  title: string,
  description: string,
  _url: string,
  image: string,
): Metadata["twitter"] {
  return {
    card: "summary_large_image",
    title,
    description,
    images: [image],
  };
}

export async function buildPublicMetadata(
  pagePath: string,
  pathname = pagePath,
): Promise<Metadata> {
  const settings = await fetchSiteSettingsMap();
  if (isComingSoonEnabled(settings)) {
    return comingSoonMetadata;
  }
  return buildPageMetadata(pagePath, pathname);
}

export async function buildPageMetadata(
  pagePath: string,
  pathname = pagePath,
): Promise<Metadata> {
  const seo = await fetchSeoForPage(pagePath);
  const title = seo?.meta_title?.trim() || DEFAULT_META_TITLE;
  const description =
    seo?.meta_description?.trim() || DEFAULT_META_DESCRIPTION;
  const keywords = buildKeywords(seo);
  const ogImage = resolveOgImage(seo);
  const canonical = canonicalPath(pathname);

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE }],
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    alternates: {
      canonical,
      types: {
        "text/plain": `${getSiteUrl()}/llms.txt`,
      },
    },
    openGraph: baseOpenGraph(title, description, canonical, ogImage),
    twitter: baseTwitter(title, description, canonical, ogImage),
  };
}

export async function buildProjectMetadata(slug: string): Promise<Metadata> {
  const row = await fetchPublishedProjectBySlug(slug);
  if (!row) {
    return buildPageMetadata("/projects", `/projects/${slug}`);
  }

  const project = mapProjectRowToPublicDetail(row);
  const pathname = `/projects/${project.slug}`;
  const metaDescription =
    project.longDescription?.trim() ||
    project.description ||
    DEFAULT_META_DESCRIPTION;
  const description = metaDescription.slice(0, 320);
  const title = `${project.title} · ${SITE}`;
  const canonical = canonicalPath(pathname);
  const ogImage = absoluteUrl(project.image);

  return {
    title: { absolute: title },
    description,
    alternates: { canonical },
    openGraph: baseOpenGraph(title, description, canonical, ogImage),
    twitter: baseTwitter(title, description, canonical, ogImage),
  };
}

export const adminMetadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Admin",
};

export const comingSoonMetadata: Metadata = {
  title: `Coming Soon | ${SITE}`,
  description:
    "The website is temporarily unavailable while a polished update is being prepared.",
  robots: { index: false, follow: false },
  openGraph: {
    title: `Coming Soon | ${SITE}`,
    description:
      "The website is temporarily unavailable while a polished update is being prepared.",
  },
};

export const notFoundMetadata: Metadata = {
  title: `Page Not Found | ${SITE}`,
  description: "The page you are looking for does not exist or has been moved.",
  robots: { index: false, follow: false },
};
