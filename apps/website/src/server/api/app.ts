import { Hono } from "hono";

import { logServerEvent } from "./lib/logger";
import { jsonCharset } from "./middleware/jsonCharset";
import { requestContext } from "./middleware/requestContext";
import { adminCacheRoutes } from "./routes/adminCache";
import { contactRoutes } from "./routes/contact";
import { pageviewRoutes } from "./routes/pageview";
import { publicContentRoutes } from "./routes/publicContent";
import { revalidateRoutes } from "./routes/revalidate";
import type { ApiEnv } from "./types";

/**
 * The Website application's HTTP API.
 *
 * Mounted behind the single Next.js catch-all at `src/app/api/[[...route]]`
 * (`@hono/vercel`), so `basePath("/api")` keeps every existing `/api/*` URL
 * working. Outreach + cron are owned by the Workspace app since Stage D; this
 * layer serves the public reads, contact, pageview and cache-flush endpoints.
 */
export const api = new Hono<ApiEnv>().basePath("/api");

api.use(requestContext);
api.use(jsonCharset);

api.route("/", publicContentRoutes);
api.route("/", contactRoutes);
api.route("/", pageviewRoutes);
api.route("/", revalidateRoutes);
api.route("/", adminCacheRoutes);

/**
 * 404 vs 405 fallback — restores the pre-Hono Next.js route-handler contract:
 * unknown endpoint → 404, known endpoint + unsupported verb → 405 (+ `Allow`).
 * The old per-route handlers got both statuses from the framework for free;
 * Hono reports an unregistered verb as "no match", so the distinction is
 * rebuilt here from the paths recorded during route registration. Status
 * codes match the baseline; the *bodies* are JSON (the framework's were not),
 * which no in-repo client reads. `notFound` is never reached because this
 * `all("*")` fallback answers every unmatched request.
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
 * Last-resort handler. Individual routes keep their own try/catch so the
 * status codes and payloads they returned before the migration are unchanged;
 * anything that escapes them lands here as a 500 JSON error.
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
