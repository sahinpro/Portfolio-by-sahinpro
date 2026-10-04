import {
  createChallenge,
  listChallenges,
} from "@/admin/lib/challengeFiles";
import { requireAdmin } from "@/admin/lib/requireAdminRequest";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function looksLikeHtml(html: string): boolean {
  return /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
}

export async function GET(request: Request): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const challenges = await listChallenges();
  return NextResponse.json({ challenges });
}

export async function POST(request: Request): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;

  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const file = form.get("html");
  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Add an HTML file" }, { status: 400 });
  }
  const html = await file.text();
  if (!looksLikeHtml(html)) {
    return NextResponse.json(
      { error: "That file does not look like an HTML document" },
      { status: 400 },
    );
  }

  try {
    const challenge = await createChallenge(title, html);
    return NextResponse.json({ challenge });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save challenge";
    const status = message.includes("already exists") ? 409 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
