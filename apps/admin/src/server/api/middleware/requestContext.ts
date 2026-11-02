import { createMiddleware } from "hono/factory";

import { logServerEvent } from "../lib/logger";
import type { ApiEnv } from "../types";

/**
 * Request id + access logging for every API call.
 *
 * Reuses an inbound `x-request-id` when a caller (or the Vercel edge proxy)
 * already set one, so a single request can be traced across services. The id is
 * echoed back on the response — an additive header, no existing header changes.
 */
export const requestContext = createMiddleware<ApiEnv>(async (c, next) => {
  const requestId = c.req.header("x-request-id")?.trim() || crypto.randomUUID();
  const startedAt = Date.now();

  c.set("requestId", requestId);
  c.set("startedAt", startedAt);
  c.header("x-request-id", requestId);

  await next();

  logServerEvent("info", "api_request", {
    requestId,
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    durationMs: Date.now() - startedAt,
  });
});
