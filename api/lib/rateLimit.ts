type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 6;
const DEFAULT_WINDOW_MS = 60_000;

function readLimit(): number {
  const raw = process.env.CONTACT_RATE_LIMIT_PER_MINUTE?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_LIMIT;
}

function readWindowMs(): number {
  const raw = process.env.CONTACT_RATE_LIMIT_WINDOW_MS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_WINDOW_MS;
  return Number.isFinite(parsed) && parsed >= 10_000 ? parsed : DEFAULT_WINDOW_MS;
}

/**
 * Best-effort per-IP limiter for Edge isolates.
 * Under extreme load (e.g. thousands of concurrent bots), combine with Turnstile
 * and Resend's own 5 req/sec team rate limit.
 */
export function checkContactRateLimit(clientIp: string): {
  ok: boolean;
  retryAfter?: number;
} {
  const key = clientIp || "unknown";
  const limit = readLimit();
  const windowMs = readWindowMs();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { ok: true };
}
