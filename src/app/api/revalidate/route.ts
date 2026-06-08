import { ALL_CACHE_TAGS, type CacheTag } from "@/lib/revalidate";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function isAuthorized(request: Request): boolean {
  const token = request.headers.get("x-revalidate-token") ?? "";
  const secret =
    process.env.REVALIDATE_SECRET ??
    process.env.NEXT_PUBLIC_ANALYTICS_INGEST_SECRET ??
    process.env.VITE_ANALYTICS_INGEST_SECRET ??
    "";
  return Boolean(secret) && token === secret;
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
  for (const tag of tags) {
    revalidateTag(tag);
  }

  const paths = body.paths ?? [];
  for (const path of paths) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, tags, paths });
}
