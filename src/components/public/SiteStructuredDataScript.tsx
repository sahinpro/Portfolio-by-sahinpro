import { PROFILE } from "@/constants/profile";
import { getSiteUrl } from "@/constants/site";
import { DEFAULT_META_DESCRIPTION } from "@/lib/seoDefaults";
import { PROFILE_PORTRAIT } from "@/lib/seoImages";

const PERSON_ID = `${getSiteUrl()}/#person`;
const WEBSITE_ID = `${getSiteUrl()}/#website`;
const PORTRAIT_ID = `${getSiteUrl()}/#profile-image`;

export function siteStructuredDataGraph() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: siteUrl,
        name: PROFILE.name,
        description: DEFAULT_META_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": PERSON_ID },
      },
      {
        "@type": "ImageObject",
        "@id": PORTRAIT_ID,
        url: PROFILE_PORTRAIT.url,
        contentUrl: PROFILE_PORTRAIT.url,
        width: PROFILE_PORTRAIT.width,
        height: PROFILE_PORTRAIT.height,
        caption: PROFILE_PORTRAIT.alt,
        name: `${PROFILE.name} — ${PROFILE.role}`,
        inLanguage: "en",
      },
      {
        "@type": "Person",
        "@id": PERSON_ID,
        name: PROFILE.name,
        url: siteUrl,
        image: { "@id": PORTRAIT_ID },
        jobTitle: PROFILE.role,
        description: PROFILE.bio,
        email: `mailto:${PROFILE.email}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: PROFILE.location,
          addressCountry: "BD",
        },
        sameAs: [PROFILE.linkedIn, PROFILE.whatsappUrl].filter(Boolean),
      },
      {
        "@type": "ProfessionalService",
        "@id": `${siteUrl}/#business`,
        name: `${PROFILE.name} — ${PROFILE.role}`,
        url: siteUrl,
        image: { "@id": PORTRAIT_ID },
        description: PROFILE.aboutIntro,
        areaServed: "Worldwide",
        founder: { "@id": PERSON_ID },
      },
    ],
  };
}

export function SiteStructuredDataScript(): JSX.Element {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(siteStructuredDataGraph()),
      }}
    />
  );
}
