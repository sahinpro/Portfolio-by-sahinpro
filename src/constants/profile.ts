/** Canonical public profile    aligned with LinkedIn / resume (May 2026). */
export const PROFILE = {
  name: "Sahin Alam",
  role: "Full Stack Developer",
  headline: "Full Stack Developer · React · Next.js · WordPress CMS",
  tagline: "Building fast, modern web experiences",
  /** Hero gradient lines    stack/role only; tagline is separate plain text */
  heroSubtitleLines: [
    "Full Stack Developer",
    "React · Next.js · WordPress CMS & WooCommerce",
  ],
  location: "Sylhet, Bangladesh",
  email: "sahinweb@proton.me",
  phone: "+8801791992313",
  whatsappUrl: "https://wa.me/8801791992313",
  linkedIn: "https://www.linkedin.com/in/sahinpro",
  portfolioUrl: "https://sahin.pro.bd/",
  yearsExperience: "3+",
  projectsDelivered: "200+",
  /** Outcome-focused    hero prose (left column only) */
  bio: " I'm a Full Stack Developer at We Next Coder, delivering 200+ WordPress, WooCommerce projects plus modern React & Next.js products like payment platforms.",
  /** Bullet highlights for hero code panel    complements {@link bio}, not duplicated */
  codeHighlights: [
    "JavaScript Fundamentals & Modern Web Development.",
    "React, Next.js, WordPress & WooCommerce.",
    "200+ projects delivered for clients worldwide under Next Coder Agency.",
  ],
  aboutIntro:
    "Since March 2023 I've been a Full Stack Web Developer at We Next Coder, delivering 200+ WordPress, WooCommerce, and Shopify projects plus modern Next.js products like payment platforms. I also work independently for local and international clients  always focused on clean code , focused on JavaScript fundamentals, fast performance, and outcomes you can measure.",
  journeyDescription:
    "Three years shipping real client work    WordPress, WooCommerce, and Shopify at scale, plus Next.js products, Figma/PSD builds, and long-term support.",
  imageCaption:
    "Full Stack developer from Bangladesh    WordPress, WooCommerce, React, and Next.js for teams worldwide.",
  certifications: [
    "Introduction to Programming Using HTML and CSS",
    "Best Straight To The Point WordPress Course",
  ],
  topSkills: [
    "JavaScript",
    "React",
    "Next.js",
    "Node.js",
    "WordPress",
    "WooCommerce",
  ],
} as const;

/** Superseded hero copy still stored in site settings    map to {@link PROFILE.bio}. */
export const LEGACY_HERO_DESCRIPTIONS = [
  "Full Stack Developer specializing in WordPress, Shopify, React, and Next.js building modern web apps and e-commerce stores for clients worldwide.",
] as const;

export function resolveHeroDescription(stored: string | undefined): string {
  const trimmed = stored?.trim();
  if (!trimmed) return PROFILE.bio;
  if (
    LEGACY_HERO_DESCRIPTIONS.some(
      (legacy) => legacy.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    return PROFILE.bio;
  }
  return trimmed;
}

export const PROFILE_TYPEWRITER_FALLBACK = [
  "Full Stack Developer",
  "React · Next.js · WordPress · Shopify",
] as const;

/** Frameworks, languages, and styling    typical “stack” items */
export const PROFILE_STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "MongoDB",
  "Tailwind CSS",
] as const;

/** CMS / e-commerce platforms (not a stack, but core to your work) */
export const PROFILE_PLATFORMS = [
  "WordPress",
  "WooCommerce",
  "Shopify",
] as const;
