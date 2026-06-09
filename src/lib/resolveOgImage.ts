import { absoluteUrl, DEFAULT_OG_IMAGE_PATH, getSiteUrl } from "@/constants/site";
import { DEFAULT_OG_IMAGE } from "@/lib/seoDefaults";
import { STALE_OG_HOSTS, STALE_OG_IMAGE_PATHS, STALE_OG_IMAGE_SUFFIXES } from "@/lib/seoPageDefaults";

function siteHostname(): string {
  try {
    return new URL(getSiteUrl()).hostname.toLowerCase();
  } catch {
    return "sahin.pro.bd";
  }
}

/** Normalize admin/DB OG image values and drop known stale assets. */
export function normalizeOgImagePath(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;

  let value = raw.trim();

  for (const host of STALE_OG_HOSTS) {
    value = value.replace(
      new RegExp(`https?://${host.replaceAll(".", "\\.")}`, "gi"),
      getSiteUrl(),
    );
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsed = new URL(value);
      if (parsed.hostname.toLowerCase() === siteHostname()) {
        value = `${parsed.pathname}${parsed.search}`;
      }
    } catch {
      return null;
    }
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  const pathLower = path.split("?")[0]?.toLowerCase() ?? path.toLowerCase();

  if (STALE_OG_IMAGE_PATHS.has(pathLower)) {
    return null;
  }

  if (STALE_OG_IMAGE_SUFFIXES.some((suffix) => pathLower.endsWith(suffix))) {
    return null;
  }

  return path;
}

export function resolveOgImageUrl(
  custom: string | null | undefined,
  fallbackPath = DEFAULT_OG_IMAGE_PATH,
): string {
  const normalized = normalizeOgImagePath(custom);
  if (normalized) return absoluteUrl(normalized);
  if (fallbackPath) return absoluteUrl(fallbackPath);
  return DEFAULT_OG_IMAGE;
}

export function ogImageMimeType(imageUrl: string): string {
  const path = imageUrl.split("?")[0]?.toLowerCase() ?? "";
  if (path.endsWith(".webp")) return "image/webp";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".avif")) return "image/avif";
  return "image/jpeg";
}
