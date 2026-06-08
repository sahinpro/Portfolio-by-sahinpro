import { PROFILE } from "@/constants/profile";
import {
  DEFAULT_OG_IMAGE_PATH,
  PROFILE_AVATAR_PATH,
  absoluteUrl,
} from "@/constants/site";

/** Descriptive alt text for the primary profile portrait (image SEO). */
export const PROFILE_PORTRAIT_ALT = `${PROFILE.name} — ${PROFILE.role} · React · Next.js · WordPress`;

/** Smaller avatar alt (header, favicon-adjacent UI). */
export const PROFILE_AVATAR_ALT = `${PROFILE.name} — ${PROFILE.role} portfolio logo`;

export const OG_IMAGE = {
  url: absoluteUrl(DEFAULT_OG_IMAGE_PATH),
  path: DEFAULT_OG_IMAGE_PATH,
  width: 460,
  height: 460,
  alt: PROFILE_PORTRAIT_ALT,
  type: "image/webp",
} as const;

export const PROFILE_PORTRAIT = {
  url: OG_IMAGE.url,
  path: DEFAULT_OG_IMAGE_PATH,
  width: OG_IMAGE.width,
  height: OG_IMAGE.height,
  alt: PROFILE_PORTRAIT_ALT,
} as const;

export const PROFILE_AVATAR = {
  url: absoluteUrl(PROFILE_AVATAR_PATH),
  path: PROFILE_AVATAR_PATH,
  width: 96,
  height: 96,
  alt: PROFILE_AVATAR_ALT,
} as const;

export function projectImageAlt(title: string): string {
  return `${title} — project by ${PROFILE.name}, ${PROFILE.role}`;
}
