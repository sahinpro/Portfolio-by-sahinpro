import { flushPublicCache } from "@/lib/runPublicRevalidation";
import { parseCacheFlushBody } from "@sahinpro/shared/cacheFlushSchema";
import { ALL_CACHE_TAGS } from "@sahinpro/shared/revalidate";
import { Hono } from "hono";
import { readJsonBody } from "../lib/jsonBody";
import { logServerEvent } from "../lib/logger";
import type { ApiEnv } from "../types";

/**
 * `POST /api/revalidate` — server-to-server cache flush.
 *
 * Callers: the admin/workspace apps (with the server-only `REVALIDATE_SECRET`)
 * and any pre-split client that still sends the browser-bundled public secret.
 * The accepted secret list is unchanged, including the legacy `VITE_*` name.
 * The Admin app's `/api/admin/flush-cache` and `/api/_revalidate` both relay
 * here, so this is the single entry point for cross-deployment flushes.
 */
function revalidateSecrets(): string[] {
  return [
    process.env.REVALIDATE_SECRET,
    process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
    process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET,
    process.env.VITE_ANALYTICS_INGEST_SECRET,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function isAuthorized(c: {
  req: { header: (name: string) => string | undefined };
}): boolean {
  const token = c.req.header("x-revalidate-token")?.trim() ?? "";
  if (!token) return false;
  return revalidateSecrets().some((secret) => token === secret);
}

export const revalidateRoutes = new Hono<ApiEnv>().post(
  "/revalidate",
  async (c) => {
    if (!isAuthorized(c)) {
      logServerEvent("warn", "revalidate_unauthorized", {
        requestId: c.get("requestId"),
        path: c.req.path,
      });
      return c.json({ error: "Unauthorized" }, 401);
    }

    const parsed = parseCacheFlushBody(await readJsonBody(c));
    if (!parsed.ok) {
      return c.json({ error: parsed.error }, 400);
    }

    const tags = parsed.tags?.length ? parsed.tags : ALL_CACHE_TAGS;
    const result = await flushPublicCache({ tags });

    return c.json({ flushed: true, ...result });
  },
);
