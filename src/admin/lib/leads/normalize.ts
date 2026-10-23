/** Input normalization + identity helpers for the local Lead CRM. */

/** Trim + lowercase an email; returns "" when blank. */
export function normalizeEmail(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Ensure a URL has a scheme so `new URL()` can parse it.
 * Adds `https://` when missing; leaves existing schemes untouched.
 */
function coerceUrl(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return v; // mailto:, tel:, etc.
  return `https://${v}`;
}

/** Normalize a user-entered URL: trims and adds https when a bare domain is given. */
export function normalizeUrl(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  return coerceUrl(v);
}

/** Returns true when the value can be parsed as an http(s) URL. */
export function isHttpUrl(value: string | null | undefined): boolean {
  const v = (value ?? "").trim();
  if (!v) return false;
  try {
    const u = new URL(coerceUrl(v));
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

/** Lowercase registrable domain (e.g. "example.com") from a website URL. */
export function extractDomain(value: string | null | undefined): string {
  const v = (value ?? "").trim();
  if (!v) return "";
  try {
    const u = new URL(coerceUrl(v));
    return u.hostname.replace(/^www\./i, "").toLowerCase();
  } catch {
    return "";
  }
}

/** Build a stable social identity fragment (e.g. "ig/instagram.com/acme"). */
function socialKey(prefix: string, value: string | null | undefined): string {
  const domain = extractDomain(value);
  if (!domain) return "";
  try {
    const u = new URL(coerceUrl((value ?? "").trim()));
    const path = u.pathname.replace(/^\/+|\/+$/g, "").toLowerCase();
    return path ? `${prefix}/${domain}/${path}` : `${prefix}/${domain}`;
  } catch {
    return `${prefix}/${domain}`;
  }
}

/**
 * Build a stable identity key used for duplicate detection.
 * Priority: website domain → email → instagram → facebook.
 * Returns "" when nothing identifying is available (name alone is NOT used,
 * because different businesses can share similar names).
 */
export function buildNormalizedKey(input: {
  websiteUrl?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
}): string {
  const domain = extractDomain(input.websiteUrl);
  if (domain) return `domain:${domain}`;

  const email = normalizeEmail(input.email);
  if (email) return `email:${email}`;

  const ig = socialKey("ig", input.instagramUrl);
  if (ig) return ig;

  const fb = socialKey("fb", input.facebookUrl);
  if (fb) return fb;

  return "";
}

/** Generate a stable unique id for a new lead (with a graceful fallback). */
export function createLeadId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `lead-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
