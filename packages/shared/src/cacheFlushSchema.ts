import type { CacheTag } from "./revalidate";

/**
 * Runtime validation for a cache-flush request body.
 *
 * Used by both the Website and the Admin Hono API layers, which accept the same
 * `{ tags? }` payload. Kept in `shared` because the two apps must reject and
 * default identically — a divergent copy would change which requests get a 400.
 *
 * Mirrors the pre-Hono behaviour exactly: anything without a usable `tags`
 * value (empty body, non-JSON body, `{}`, `{ tags: [] }`) flushes every tag.
 * Only the *shape* is validated — an unknown tag name still passes through and
 * still answers 200 like it did before, so no previously working caller changes
 * status. Malformed `tags` (not an array of strings) get a clean 400 instead of
 * failing deeper inside the Redis flush with a 500.
 */
export type ParsedFlushBody =
  | { ok: true; tags: CacheTag[] | undefined }
  | { ok: false; error: string };

export function parseCacheFlushBody(raw: unknown): ParsedFlushBody {
  if (raw === null || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: true, tags: undefined };
  }

  const value = (raw as { tags?: unknown }).tags;
  if (value === undefined || value === null)
    return { ok: true, tags: undefined };

  if (!Array.isArray(value) || !value.every((tag) => typeof tag === "string")) {
    return { ok: false, error: "Invalid tags" };
  }

  return { ok: true, tags: value as CacheTag[] };
}
