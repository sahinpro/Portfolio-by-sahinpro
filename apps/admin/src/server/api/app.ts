import { Hono } from "hono";

import { logServerEvent } from "./lib/logger";
import { jsonCharset } from "./middleware/jsonCharset";
import { requestContext } from "./middleware/requestContext";
import { websiteRevalidateRoutes } from "./routes/websiteRevalidate";
import type { ApiEnv } from "./types";

/**
 * The Admin application's HTTP API.
 *
 * Mounted behind the single Next.js catch-all at `src/app/api/[[...route]]`
 * (`@hono/vercel`), so `basePath("/api")` keeps every existing `/api/*` URL
 * working. The CMS reads and writes Supabase directly under RLS — it has no
 * data endpoints of its own — so this layer only carries cache control today:
 * the website-cache relay (audit §11) plus the legacy `flush-cache` alias.
 *
 * The outreach endpoints (`/api/admin/outreach-*`) moved to the Workspace app
 * in Stage D — this app serves cache control only.
 */
export const api = new Hono<ApiEnv>().basePath("/api");

api.use(requestContext);
api.use(jsonCharset);

api.route("/", websiteRevalidateRoutes);

/**
 * 404 vs 405 fallback — restores the pre-Hono Next.js route-handler contract:
 * unknown endpoint → 404, known endpoint + unsupported verb → 405 (+ `Allow`).
 * Status codes match the baseline; the bodies are JSON (the framework's were
 * not), which no in-repo client reads. See the Website app for the full
 * rationale — the registry walk is identical in all three apps.
 */
const methodsByPath = new Map<string, Set<string>>();
for (const route of api.routes) {
  const verb = String(route.method).toUpperCase();
  if (verb === "ALL" || route.path.includes("*")) continue; // middleware registrations
  const normalized = route.path.replace(/\/+$/, "") || "/";
  const verbs = methodsByPath.get(normalized) ?? new Set<string>();
  verbs.add(verb);
  methodsByPath.set(normalized, verbs);
}

api.all("*", (c) => {
  const path = c.req.path.replace(/\/+$/, "") || "/";
  const allowed = methodsByPath.get(path);
  if (allowed) {
    return c.json(
      { error: "Method Not Allowed" },
      { status: 405, headers: { Allow: [...allowed].sort().join(", ") } },
    );
  }
  return c.json({ error: "Not Found" }, 404);
});

/**
 * Last-resort handler. Routes keep their own try/catch so status codes and
 * payloads are what the pre-split callers expect; anything that escapes them
 * lands here as a 500 JSON error with the cause logged server-side only.
 */
api.onError((err, c) => {
  logServerEvent("error", "api_unhandled_error", {
    requestId: c.get("requestId"),
    method: c.req.method,
    path: c.req.path,
    message: err instanceof Error ? err.message : String(err),
  });
  return c.json({ error: "Internal Server Error" }, 500);
});
