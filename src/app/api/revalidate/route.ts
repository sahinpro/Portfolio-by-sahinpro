import { ALL_CACHE_TAGS, type CacheTag } from "@/lib/revalidate";
import { flushPublicCache } from "@/lib/runPublicRevalidation";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function revalidateSecrets(): string[] {
  return [
    process.env.REVALIDATE_SECRET,
    process.env.NEXT_PUBLIC_REVALIDATE_SECRET,
    process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET,
    process.env.VITE_ANALYTICS_INGEST_SECRET,
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function isAuthorized(request: Request): boolean {
  const token = request.headers.get("x-revalidate-token")?.trim() ?? "";
  if (!token) return false;
  return revalidateSecrets().some((secret) => token === secret);
}

type FlushBody = {
  tags?: CacheTag[];
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: FlushBody = {};
  try {
    body = (await request.json()) as FlushBody;
  } catch {
    /* empty body flushes all public Redis keys */
  }

  const tags = body.tags?.length ? body.tags : ALL_CACHE_TAGS;
  const result = await flushPublicCache({ tags });

  return NextResponse.json({ flushed: true, ...result });
}
