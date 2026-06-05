import { handleContactSubmission } from "./lib/contactHandler";
import type { ContactRequestBody } from "./lib/types";

export const config = {
  runtime: "edge",
};

const MAX_BODY_BYTES = 32_768;

function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: Record<string, string>,
): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extraHeaders,
    },
  });
}

function parseBody(raw: string | null): ContactRequestBody {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ContactRequestBody;
  } catch {
    return {};
  }
}

function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Request body too large" }, 413);
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return jsonResponse({ error: "Request body too large" }, 413);
  }

  const result = await handleContactSubmission(parseBody(rawBody), {
    clientIp: getClientIp(request),
    idempotencyKey: request.headers.get("x-idempotency-key")?.trim() ?? "",
  });

  if (result.ok) {
    return jsonResponse({ ok: true });
  }

  const headers: Record<string, string> = {};
  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return jsonResponse({ error: result.error }, result.status, headers);
}
