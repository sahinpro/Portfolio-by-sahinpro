import { createMiddleware } from "hono/factory";

import type { ApiEnv } from "../types";

/**
 * The pre-migration handlers answered with `NextResponse.json()`, i.e.
 * `application/json;charset=utf-8`; Hono answers `application/json`. Restore the
 * exact media type so existing clients see the same header they did before the
 * monorepo split.
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
