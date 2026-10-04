import {
  deleteChallenge,
  readChallenge,
  updateChallenge,
} from "@/admin/lib/challengeFiles";
import { requireAdmin } from "@/admin/lib/requireAdminRequest";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

function looksLikeHtml(html: string): boolean {
  return /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html);
}

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { slug } = await context.params;
  try {
    const challenge = await readChallenge(slug);
    if (!challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }
    return NextResponse.json({ challenge });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not read challenge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { slug } = await context.params;
  const form = await request.formData();
  const title = String(form.get("title") ?? "").trim();
  const file = form.get("html");
  let html: string | undefined;
  if (file instanceof File && file.size > 0) {
    html = await file.text();
    if (!looksLikeHtml(html)) {
      return NextResponse.json(
        { error: "That file does not look like an HTML document" },
        { status: 400 },
      );
    }
  }

  try {
    const challenge = await updateChallenge(slug, {
      title: title || undefined,
      html,
    });
    return NextResponse.json({ challenge });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save challenge";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { slug } = await context.params;
  try {
    await deleteChallenge(slug);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not delete challenge";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
