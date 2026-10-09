import { fetchActiveResume } from "@/data/publicSupabase.server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function attachmentDisposition(fileName: string): string {
  const fallback = fileName.replace(/[^\x20-\x7E]+/g, "_").replace(/"/g, "");
  const encoded = encodeURIComponent(fileName);
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

export async function GET(): Promise<NextResponse> {
  const resume = await fetchActiveResume();
  if (!resume?.file_url) {
    return NextResponse.json(
      { error: "Resume is not available" },
      { status: 404 },
    );
  }

  const upstream = await fetch(resume.file_url, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { error: "Resume file is missing from storage" },
      { status: 404 },
    );
  }

  const fileName = resume.file_name?.trim() || "Sahin_Alam_Resume.pdf";
  const contentType = upstream.headers.get("content-type") || "application/pdf";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": attachmentDisposition(fileName),
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
    },
  });
}
