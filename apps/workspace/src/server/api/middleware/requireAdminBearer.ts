import { createMiddleware } from "hono/factory";

import { extractBearerToken, isAuthorizedBearerToken } from "../lib/adminAuth";
import { logServerEvent } from "../lib/logger";
import type { ApiEnv } from "../types";

/**
 * Guards admin-only API routes. Unauthenticated/foreign callers get the same
 * `{ error: "Unauthorized" }` + 401 the Next.js route handler returned before
 * the Hono migration — clients key off that shape.
 */
export const requireAdminBearer = createMiddleware<ApiEnv>(async (c, next) => {
  const token = extractBearerToken(c.req.header("authorization"));
  if (!(await isAuthorizedBearerToken(token))) {
    logServerEvent("warn", "api_unauthorized", {
      requestId: c.get("requestId"),
      path: c.req.path,
      reason: token ? "not_admin" : "missing_bearer",
    });
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
