/** Canonical production origin (no trailing slash). */
export const SITE_URL = "https://www.sahinpro.me";

/** Hosts that must 301 to SITE_URL so Google stops ranking the old domain. */
export const LEGACY_HOSTS = ["sahin.pro.bd", "www.sahin.pro.bd"] as const;

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
  if (path === "/") {
    return `${getSiteUrl()}/${search}`;
  }
  return absoluteUrl(`${path}${search}`);
}
