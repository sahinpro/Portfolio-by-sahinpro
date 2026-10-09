import { handleContactSubmission } from "../../../../api/lib/contactHandler";
import type { ContactRequestBody } from "../../../../api/lib/types";
import { NextResponse } from "next/server";

export const runtime = "edge";

const MAX_BODY_BYTES = 32_768;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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

export async function OPTIONS() {
  return NextResponse.json({ ok: true }, { headers: corsHeaders });
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413, headers: corsHeaders },
    );
  }

  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "Request body too large" },
      { status: 413, headers: corsHeaders },
    );
  }

  const result = await handleContactSubmission(parseBody(rawBody), {
    clientIp: getClientIp(request),
    idempotencyKey: request.headers.get("x-idempotency-key")?.trim() ?? "",
  });

  if (result.ok) {
    return NextResponse.json({ ok: true }, { headers: corsHeaders });
  }

  const headers: Record<string, string> = { ...corsHeaders };
  if (result.retryAfter) {
    headers["Retry-After"] = String(result.retryAfter);
  }

  return NextResponse.json(
    { error: result.error },
    { status: result.status, headers },
  );
}
