import { isAuthorizedAdmin } from "../../../../../api/_lib/adminRouteAuth";
import { sanitizePlannerZones } from "../../../../../api/_lib/outreach/zonesConfig";
import { SITE_SETTING_PLANNER_ZONES_KEY } from "../../../../../api/_lib/outreach/types";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function GET(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = serviceClient();
  if (!client) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await client
    .from("site_settings")
    .select("value")
    .eq("key", SITE_SETTING_PLANNER_ZONES_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let outreachZones: Record<string, string> = {};
  if (data?.value) {
    try {
      outreachZones = sanitizePlannerZones(JSON.parse(data.value));
    } catch {
      outreachZones = {};
    }
  }

  return NextResponse.json({ outreachZones });
}

type PutBody = { outreachZones?: Record<string, string> };

export async function PUT(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client = serviceClient();
  if (!client) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: PutBody = {};
  try {
    body = (await request.json()) as PutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const outreachZones = sanitizePlannerZones(body.outreachZones ?? {});
  const { error } = await client.from("site_settings").upsert(
    {
      key: SITE_SETTING_PLANNER_ZONES_KEY,
      value: JSON.stringify(outreachZones),
    },
    { onConflict: "key" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, outreachZones });
}
