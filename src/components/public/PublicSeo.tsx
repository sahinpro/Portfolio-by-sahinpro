import type { SeoSettingsRow } from "@/admin/types/database";
import { normalizeSeoPagePath } from "@/components/public/seoPath";
import { SiteStructuredData } from "@/components/public/SiteStructuredData";
import { PROFILE } from "@/constants/profile";
import { absoluteUrl, canonicalPath, getSiteUrl } from "@/constants/site";
import { useSeoForPage } from "@/hooks/useSeoForPage";
import {
  DEFAULT_KEYWORDS,
  DEFAULT_META_DESCRIPTION,
  DEFAULT_META_TITLE,
  DEFAULT_OG_IMAGE,
} from "@/lib/seoDefaults";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

function buildKeywords(row: SeoSettingsRow | null): string {
  return row?.keywords?.trim() || DEFAULT_KEYWORDS;
}

function resolveOgImage(row: SeoSettingsRow | null): string {
  const custom = row?.og_image?.trim();
  if (!custom) return DEFAULT_OG_IMAGE;
  return absoluteUrl(custom);
}

export function PublicSeo(): JSX.Element {
  const { pathname, search } = useLocation();
  const page = normalizeSeoPagePath(pathname);
  const { seo } = useSeoForPage(page, { deferMs: 4500 });

  const documentTitle = seo?.meta_title?.trim() || DEFAULT_META_TITLE;
  const description = seo?.meta_description?.trim() || DEFAULT_META_DESCRIPTION;
  const ogImage = resolveOgImage(seo);
  const keywords = buildKeywords(seo);
  const canonical = canonicalPath(pathname, search);
  const siteUrl = getSiteUrl();

  return (
    <>
      <SiteStructuredData />
      <Helmet prioritizeSeoTags>
        <html lang="en" />
        <title>{documentTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={PROFILE.name} />
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <link rel="canonical" href={canonical} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={PROFILE.name} />
        <meta property="og:locale" content="en_US" />
        <meta property="og:url" content={canonical} />
        <meta property="og:title" content={documentTitle} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:image:alt" content={`${PROFILE.name} — ${PROFILE.role}`} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={canonical} />
        <meta name="twitter:title" content={documentTitle} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="twitter:image:alt" content={`${PROFILE.name} — ${PROFILE.role}`} />

        <link rel="alternate" type="text/plain" href={`${siteUrl}/llms.txt`} title="LLMs documentation" />
      </Helmet>
    </>
  );
}
