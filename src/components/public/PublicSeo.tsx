import type { SeoSettingsRow } from "@/admin/types/database";
import { normalizeSeoPagePath } from "@/components/public/seoPath";
import { useSeoForPage } from "@/hooks/useSeoForPage";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Sahin Alam";

function buildKeywords(row: SeoSettingsRow | null): string | undefined {
  const k = row?.keywords?.trim();
  return k || undefined;
}

export function PublicSeo(): JSX.Element | null {
  const { pathname } = useLocation();
  const page = normalizeSeoPagePath(pathname);
  const { seo } = useSeoForPage(page);

  const documentTitle = seo?.meta_title?.trim() || SITE_NAME;
  const description = seo?.meta_description?.trim() || undefined;
  const ogImage = seo?.og_image?.trim() || undefined;
  const keywords = buildKeywords(seo);

  return (
    <Helmet prioritizeSeoTags>
      <title>{documentTitle}</title>
      <meta property="og:title" content={documentTitle} />
      {description ? <meta name="description" content={description} /> : null}
      {description ? <meta property="og:description" content={description} /> : null}
      {ogImage ? <meta property="og:image" content={ogImage} /> : null}
      {keywords ? <meta name="keywords" content={keywords} /> : null}
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
