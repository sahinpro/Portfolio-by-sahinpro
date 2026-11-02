/** Canonical production origin (apex, no trailing slash, no `www`). */
export const SITE_URL = "https://sahinpro.me";

/**
 * Hosts that must 301 to SITE_URL so Google stops ranking the old URL space:
 * the retired `sahin.pro.bd` domain and the `www` hostname of the current
 * domain (the apex is canonical; `www` must never serve content).
 */
export const LEGACY_HOSTS = [
  "sahin.pro.bd",
  "www.sahin.pro.bd",
  "www.sahinpro.me",
] as const;

export const DEFAULT_OG_IMAGE_PATH = "/share-card.jpeg";

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
