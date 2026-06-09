import type { SeoSettingsRow } from "@/admin/types/database";
import { PROFILE } from "@/constants/profile";
import { canonicalPath, getSiteUrl } from "@/constants/site";
import { fetchSeoForPage, fetchSiteSettingsMap } from "@/data/publicSupabase.server";
import { resolveOgImageUrl, ogImageMimeType } from "@/lib/resolveOgImage";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
} from "@/lib/seoDefaults";
import { OG_IMAGE } from "@/lib/seoImages";
import { isComingSoonEnabled } from "@/lib/siteMode";
import type { Metadata } from "next";

const SITE = PROFILE.name;

function buildKeywords(row: SeoSettingsRow | null): string {
  return row?.keywords?.trim() || DEFAULT_KEYWORDS;
}

function ogImageMeta(
  imageUrl: string,
  alt: string,
  width = OG_IMAGE.width,
  height = OG_IMAGE.height,
  type = ogImageMimeType(imageUrl),
): NonNullable<Metadata["openGraph"]>["images"] {
  return [
    {
      url: imageUrl,
      width,
      height,
      alt,
      type,
    },
  ];
}

function resolveOgImage(row: SeoSettingsRow | null, fallback?: string): string {
  return resolveOgImageUrl(row?.og_image, fallback);
}

function baseOpenGraph(
  title: string,
  description: string,
  url: string,
  image: string,
  imageAlt = OG_IMAGE.alt,
  type: "website" | "article" = "website",
): Metadata["openGraph"] {
  return {
    type,
    siteName: SITE,
    locale: "en_US",
    url,
    title,
    description,
    images: ogImageMeta(image, imageAlt),
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
  const description = seo?.meta_description?.trim() || DEFAULT_META_DESCRIPTION;
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
