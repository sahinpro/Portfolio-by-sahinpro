import { fetchSiteSettingsMap } from "@/data/publicSupabase.server";
import { PUBLIC_API_CACHE_CONTROL } from "@/lib/publicApiCacheHeaders";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const data = await fetchSiteSettingsMap();
  return NextResponse.json(data, {
    headers: { "Cache-Control": PUBLIC_API_CACHE_CONTROL },
  });
}
