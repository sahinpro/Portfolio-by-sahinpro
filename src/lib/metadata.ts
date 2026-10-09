import { PROFILE } from "@/constants/profile";
import { canonicalPath, getSiteUrl } from "@/constants/site";
import { resolveOgImageUrl, ogImageMimeType } from "@/lib/resolveOgImage";
import { OG_IMAGE } from "@/lib/seoImages";
import { getSeoForPath } from "@/lib/seoPageDefaults";
import type { Metadata } from "next";

const SITE = PROFILE.name;

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

/**
 * Public SEO tags. Kept synchronous so Next.js emits title/canonical/robots in
 * the initial `<head>` — async generateMetadata streams them after `</head>`,
 * which is why Search Console reported "User-declared canonical: None".
 */
export function buildPageMetadata(
  pagePath: string,
  pathname = pagePath,
): Metadata {
  const seo = getSeoForPath(pagePath);
  const title = seo.meta_title;
  const description = seo.meta_description;
  const keywords = seo.keywords;
  const ogImage = resolveOgImageUrl(seo.og_image);
  const canonical = canonicalPath(pathname);

  return {
    title,
    description,
    keywords,
    authors: [{ name: SITE }],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
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

/** @deprecated Use buildPageMetadata — kept so existing imports keep working. */
export function buildPublicMetadata(
  pagePath: string,
  pathname = pagePath,
): Metadata {
  return buildPageMetadata(pagePath, pathname);
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
