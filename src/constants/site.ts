/** Canonical production origin (no trailing slash). */
export const SITE_URL = "https://www.sahinpro.me";

export const DEFAULT_OG_IMAGE_PATH = "/sahin.jpg";

export const PROFILE_AVATAR_PATH = "/sahin.jpg";

export const PROFILE_DESK_IMAGE_PATH = "/sahin-studio.png";

export function getSiteUrl(): string {
  return SITE_URL;
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  const path = pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`;
  return `${getSiteUrl()}${path}`;
}

export function canonicalPath(pathname: string, search = ""): string {
  const path = pathname.replace(/\/$/, "") || "/";
  return absoluteUrl(`${path}${search}`);
}
