import { isAuthorizedAdmin } from "../../../../../api/_lib/adminRouteAuth";
import { sanitizeScheduleConfig } from "../../../../../api/_lib/outreach/scheduleConfig";
import {
  SITE_SETTING_SCHEDULE_CONFIG_KEY,
  type OutreachScheduleConfig,
} from "../../../../../api/_lib/outreach/types";
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
    .eq("key", SITE_SETTING_SCHEDULE_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  let schedule: OutreachScheduleConfig = sanitizeScheduleConfig(null);
  if (data?.value) {
    try {
      schedule = sanitizeScheduleConfig(JSON.parse(data.value));
    } catch {
      // Fall back to defaults on any parse error.
    }
  }

  return NextResponse.json({ schedule });
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const raw = (body as { schedule?: unknown })?.schedule;
  const schedule = sanitizeScheduleConfig(raw);

  // Enforce at least one weekday — otherwise the cron would silently
  // never fire, which is almost certainly a UI bug rather than intent.
  if (schedule.days.length === 0) {
    return NextResponse.json(
      { error: "Select at least one weekday" },
      { status: 400 },
    );
  }

  const toStore: OutreachScheduleConfig = {
    ...schedule,
    updatedAt: new Date().toISOString(),
  };

  const { error } = await client.from("site_settings").upsert(
    {
      key: SITE_SETTING_SCHEDULE_CONFIG_KEY,
      value: JSON.stringify(toStore),
    },
    { onConflict: "key" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, schedule: toStore });
}
