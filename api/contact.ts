import type { VercelRequest, VercelResponse } from "@vercel/node";
import { handleContactSubmission } from "./lib/contactHandler";

function parseBody(
  body: VercelRequest["body"],
): Record<string, string | undefined> {
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body as Record<string, string | undefined>;
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, string | undefined>;
    } catch {
      return {};
    }
  }
  return {};
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await handleContactSubmission(parseBody(req.body));

    if (result.ok) {
      res.status(200).json({ ok: true });
      return;
    }

    res.status(result.status).json({ error: result.error });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    res.status(500).json({ error: message });
  }
}
