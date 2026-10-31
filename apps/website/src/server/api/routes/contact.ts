import { Hono, type Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { handleContactSubmission } from "../../../../api/_lib/contactHandler";
import type { ContactRequestBody } from "../../../../api/_lib/types";
import { logServerEvent } from "../lib/logger";
import type { ApiEnv } from "../types";

const MAX_BODY_BYTES = 32_768;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Contact form endpoint.
 *
 * Body-size caps, the `{ ok: true }` / `{ error }` payloads, the 413/400/403/429
 * statuses, `Retry-After` and the permissive CORS headers are all carried over
 * unchanged from the previous `src/app/api/contact/route.ts`.
 *
 * Runtime note: this handler used to declare `runtime = "edge"`. It now runs on
 * the Node.js runtime together with the rest of the Hono app; the handler itself
 * only uses Web APIs (`fetch`, `Request`/`Response`), so behaviour is identical.
 */
function parseBody(raw: string | null): ContactRequestBody {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ContactRequestBody;
  } catch {
    return {};
  }
}

function getClientIp(c: Context<ApiEnv>): string {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
    c.req.header("x-real-ip")?.trim() ||
    "unknown"
  );
}

export const contactRoutes = new Hono<ApiEnv>()
  .options("/contact", (c) => c.json({ ok: true }, { headers: corsHeaders }))

  .post("/contact", async (c) => {
    const contentLength = Number(c.req.header("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return c.json(
        { error: "Request body too large" },
        { status: 413, headers: corsHeaders },
      );
    }

    const rawBody = await c.req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return c.json(
        { error: "Request body too large" },
        { status: 413, headers: corsHeaders },
      );
    }

    const result = await handleContactSubmission(parseBody(rawBody), {
      clientIp: getClientIp(c),
      idempotencyKey: c.req.header("x-idempotency-key")?.trim() ?? "",
    });

    if (result.ok) {
      return c.json({ ok: true }, { headers: corsHeaders });
    }

    const headers: Record<string, string> = { ...corsHeaders };
    if (result.retryAfter) {
      headers["Retry-After"] = String(result.retryAfter);
    }

    logServerEvent("warn", "contact_rejected", {
      requestId: c.get("requestId"),
      status: result.status,
      reason: result.error,
    });

    return c.json(
      { error: result.error },
      { status: result.status as ContentfulStatusCode, headers },
    );
  });
