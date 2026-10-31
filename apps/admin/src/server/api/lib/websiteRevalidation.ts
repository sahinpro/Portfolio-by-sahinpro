import type { CacheTag } from "@sahinpro/shared/revalidate";

/**
 * Cross-deployment website cache revalidation (audit §11, Option A).
 *
 * The public Redis/Next cache belongs to the **Website** deployment, so this app
 * must never flush a relative `/api/...` — that would only ever hit its own
 * origin. Instead the CMS calls one of its own endpoints, which verifies the
 * caller and then talks server-to-server to the Website's `POST /api/revalidate`
 * with the server-only `REVALIDATE_SECRET`.
 *
 * Two invariants here:
 *  - the destination is **never** taken from the request. It comes from
 *    `WEBSITE_URL` and must match a fixed allowlist of origins (SSRF guard);
 *  - a failure is reported, never thrown as a fatal error. The content mutation
 *    that triggered the flush has already succeeded, so the UI shows
 *    "saved, cache refresh pending" and the admin can retry.
 */
const CANONICAL_WEBSITE_ORIGIN = "https://www.sahinpro.me";

/**
 * Origins `WEBSITE_URL` may resolve to. Production is the canonical website
 * (`CANONICAL_WEBSITE_ORIGIN`); the loopback entries exist so
 * `bun run dev:admin` can flush a locally running website instead of the
 * production one. Any other value is refused.
 */
const ALLOWED_WEBSITE_ORIGINS = new Set<string>([
  CANONICAL_WEBSITE_ORIGIN,
  "https://sahinpro.me",
  "http://localhost:3000",
  "http://localhost:3100",
  "http://localhost:3200",
  "http://localhost:3400",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3100",
  "http://127.0.0.1:3200",
  "http://127.0.0.1:3400",
]);

const DEFAULT_TIMEOUT_MS = 8000;

export type RelayOutcome =
  | { ok: true; publishedProjectCount?: number }
  | { ok: false; reason: string; status?: number };

export type WebsiteRevalidateConfig = {
  endpoint: string;
  token: string;
  timeoutMs: number;
};

export type WebsiteRevalidateConfigError =
  | "missing_revalidate_secret"
  | "missing_website_url"
  | "invalid_website_url"
  | "origin_not_allowlisted";

/** Resolve + validate the relay target. Never logs or returns the secret. */
export function resolveWebsiteRevalidateConfig():
  | { config: WebsiteRevalidateConfig }
  | { error: WebsiteRevalidateConfigError } {
  const token = process.env.REVALIDATE_SECRET?.trim();
  if (!token) return { error: "missing_revalidate_secret" };

  const raw = process.env.WEBSITE_URL?.trim();
  if (!raw) return { error: "missing_website_url" };

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { error: "invalid_website_url" };
  }

  const origin = url.origin;
  if (!ALLOWED_WEBSITE_ORIGINS.has(origin)) {
    return { error: "origin_not_allowlisted" };
  }

  const configuredTimeout = Number(
    process.env.WEBSITE_REVALIDATE_TIMEOUT_MS?.trim(),
  );
  const timeoutMs =
    Number.isFinite(configuredTimeout) && configuredTimeout > 0
      ? configuredTimeout
      : DEFAULT_TIMEOUT_MS;

  return {
    config: {
      endpoint: `${origin}/api/revalidate`,
      token,
      timeoutMs,
    },
  };
}

/**
 * `POST {website}/api/revalidate` with `{ tags }`.
 *
 * 2xx is read as `{ publishedProjectCount? }`; anything else (non-2xx, timeout,
 * network error) becomes `{ ok: false, reason }` for the caller to log.
 */
export async function revalidateWebsiteCache(
  tags: CacheTag[],
): Promise<RelayOutcome> {
  const resolved = resolveWebsiteRevalidateConfig();
  if ("error" in resolved) return { ok: false, reason: resolved.error };

  const { config } = resolved;

  try {
    const res = await fetch(config.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-token": config.token,
      },
      body: JSON.stringify({ tags }),
      cache: "no-store",
      signal: AbortSignal.timeout(config.timeoutMs),
    });

    if (!res.ok) {
      return { ok: false, reason: "upstream_error", status: res.status };
    }

    const data = (await res.json().catch(() => ({}))) as {
      publishedProjectCount?: number;
    };
    return { ok: true, publishedProjectCount: data.publishedProjectCount };
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    return {
      ok: false,
      reason:
        name === "TimeoutError" ? "upstream_timeout" : "upstream_unreachable",
    };
  }
}
