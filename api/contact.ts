import { handleContactSubmission } from "./lib/contactHandler";

export const config = {
  runtime: "edge",
};

function parseBody(
  raw: string | null,
): Record<string, string | undefined> {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string | undefined>;
  } catch {
    return {};
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const body = parseBody(await request.text());
    const result = await handleContactSubmission(body);

    if (result.ok) {
      return jsonResponse({ ok: true });
    }

    return jsonResponse({ error: result.error }, result.status);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return jsonResponse({ error: message }, 500);
  }
}
