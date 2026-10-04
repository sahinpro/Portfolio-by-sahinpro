import { saveChallengeCsv } from "@/admin/lib/challengeFiles";
import { requireAdmin } from "@/admin/lib/requireAdminRequest";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(
  request: Request,
  context: RouteContext,
): Promise<NextResponse> {
  const denied = await requireAdmin(request);
  if (denied) return denied;
  const { slug } = await context.params;
  const form = await request.formData();
  const file = form.get("file");
  const niche = String(form.get("niche") ?? "");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Add a CSV file" }, { status: 400 });
  }

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    const name = await saveChallengeCsv(slug, file.name || "leads.csv", bytes, niche);
    return NextResponse.json({ name });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save CSV";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
