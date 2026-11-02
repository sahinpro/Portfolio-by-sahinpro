import { createMiddleware } from "hono/factory";

import type { ApiEnv } from "../types";

/**
 * `NextResponse.json()` answered `application/json;charset=utf-8`; Hono answers
 * `application/json`. Restore the exact media type so existing clients (and the
 * browser's own decoding) see the same header they did before the migration.
 */
export const jsonCharset = createMiddleware<ApiEnv>(async (c, next) => {
  await next();

  const contentType = c.res.headers.get("Content-Type") ?? "";
  if (
    contentType.startsWith("application/json") &&
    !contentType.includes("charset")
  ) {
    c.res.headers.set("Content-Type", "application/json;charset=utf-8");
  }
});
