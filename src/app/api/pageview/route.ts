import { NextResponse } from "next/server";

function getAnalyticsSecret(): string {
  return (
    process.env.ANALYTICS_INGEST_SECRET?.trim() ||
    process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET?.trim() ||
    ""
  );
}

function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") || "";
}

function getSupabaseKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    ""
  );
}

/** Server-side proxy so analytics failures never surface as third-party console errors. */
export async function POST(request: Request) {
  try {
    const base = getSupabaseUrl();
    const key = getSupabaseKey();
    const secret = getAnalyticsSecret();
    if (!base || !key || !secret) {
      return new NextResponse(null, { status: 204 });
    }

    const body = (await request.json().catch(() => ({}))) as { path?: string };
    const path =
      typeof body.path === "string" && body.path.length > 0
        ? body.path.slice(0, 512)
        : "/";

    await fetch(`${base}/functions/v1/record-page-view`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
        apikey: key,
        "x-analytics-secret": secret,
      },
      body: JSON.stringify({
        path,
        referrer: request.headers.get("referer")?.slice(0, 1024) ?? null,
        userAgent: request.headers.get("user-agent")?.slice(0, 512) ?? null,
      }),
    });
  } catch {
    // Analytics must never affect UX or Lighthouse best-practices score.
  }

  return new NextResponse(null, { status: 204 });
}
