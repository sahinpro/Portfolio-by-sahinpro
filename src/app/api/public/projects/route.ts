import { REVALIDATE_SECONDS } from "@/lib/revalidate";
import { fetchPublishedProjects } from "@/data/publicSupabase.server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const CACHE_CONTROL = `public, s-maxage=${REVALIDATE_SECONDS}, stale-while-revalidate=${REVALIDATE_SECONDS * 24}`;

export async function GET(): Promise<NextResponse> {
  const data = await fetchPublishedProjects();
  return NextResponse.json(data, {
    headers: { "Cache-Control": CACHE_CONTROL },
  });
}
