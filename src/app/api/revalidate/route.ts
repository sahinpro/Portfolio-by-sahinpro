import { runPublicRevalidation } from "@/lib/runPublicRevalidation";
import { ALL_CACHE_TAGS, PUBLIC_REVALIDATE_PATHS, type CacheTag } from "@/lib/revalidate";
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

type RevalidateBody = {
  tags?: CacheTag[];
  paths?: string[];
};

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: RevalidateBody = {};
  try {
    body = (await request.json()) as RevalidateBody;
  } catch {
    /* empty body revalidates all public tags */
  }

  const tags = body.tags?.length ? body.tags : ALL_CACHE_TAGS;
  const result = await runPublicRevalidation({
    tags,
    paths: body.paths?.length ? body.paths : [...PUBLIC_REVALIDATE_PATHS],
  });

  return NextResponse.json({ revalidated: true, ...result });
}
