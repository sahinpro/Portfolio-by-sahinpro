/**
 * A source link is shown only when it points at a specific repository.
 * Empty values, `https://github.com`, and bare domain roots stay hidden.
 */
export function isRepositoryUrl(
  value: string | null | undefined,
): value is string {
  const raw = value?.trim();
  if (!raw) return false;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return false;

  const segments = url.pathname
    .replace(/\/+$/, "")
    .split("/")
    .filter(Boolean);

  return segments.length >= 2;
}
