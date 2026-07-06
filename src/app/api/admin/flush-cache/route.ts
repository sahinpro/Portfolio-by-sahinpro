import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { flushPublicCache } from "@/lib/runPublicRevalidation";
import type { CacheTag } from "@/lib/revalidate";
import { ALL_CACHE_TAGS } from "@/lib/revalidate";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type FlushBody = {
  tags?: CacheTag[];
};

function getBearerToken(request: Request): string {
  const auth = request.headers.get("authorization") ?? "";
  return auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
}

async function isAuthorizedAdmin(request: Request): Promise<boolean> {
  const token = getBearerToken(request);
  if (!token) return false;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    "";
  if (!url || !key) return false;

  const supabase = createClient(url, key);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return false;
  return isAllowedAdminEmail(user);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: FlushBody = {};
  try {
    body = (await request.json()) as FlushBody;
  } catch {
    /* empty body flushes all public Redis keys */
  }

  const tags = body.tags?.length ? body.tags : [...ALL_CACHE_TAGS];
  const result = await flushPublicCache({ tags });

  return NextResponse.json({ flushed: true, ...result });
}
