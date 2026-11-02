import { Hono } from "hono";

import { getSupabaseServiceClient } from "@/server/lib/supabaseService";
import { sanitizeScheduleConfig } from "@/server/outreach/scheduleConfig";
import {
  SITE_SETTING_SCHEDULE_CONFIG_KEY,
  type OutreachScheduleConfig,
} from "@/server/outreach/types";

import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `GET`/`PUT /api/admin/outreach-schedule`.
 *
 * Ported from the pre-monorepo Next.js route handler with the auth order, status
 * codes and payload shapes preserved exactly: 401 (bearer) → 503 (no service
 * key) → 400/500. Reads and writes the `outreach_schedule_config` site setting
 * with the service-role client (only this route + the cron touch that table).
 */
export const outreachScheduleRoutes = new Hono<ApiEnv>();

outreachScheduleRoutes.get(
  "/admin/outreach-schedule",
  requireAdminBearer,
  async (c) => {
    const client = getSupabaseServiceClient();
    if (!client) {
      return c.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
        503,
      );
    }

    const { data, error } = await client
      .from("site_settings")
      .select("value")
      .eq("key", SITE_SETTING_SCHEDULE_CONFIG_KEY)
      .maybeSingle();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    let schedule: OutreachScheduleConfig = sanitizeScheduleConfig(null);
    if (data?.value) {
      try {
        schedule = sanitizeScheduleConfig(JSON.parse(data.value));
      } catch {
        // Fall back to defaults on any parse error.
      }
    }

    return c.json({ schedule });
  },
);

outreachScheduleRoutes.put(
  "/admin/outreach-schedule",
  requireAdminBearer,
  async (c) => {
    const client = getSupabaseServiceClient();
    if (!client) {
      return c.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
        503,
      );
    }

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
    }

    const raw = (body as { schedule?: unknown })?.schedule;
    const schedule = sanitizeScheduleConfig(raw);

    // Enforce at least one weekday — otherwise the cron would silently
    // never fire, which is almost certainly a UI bug rather than intent.
    if (schedule.days.length === 0) {
      return c.json({ error: "Select at least one weekday" }, 400);
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
      return c.json({ error: error.message }, 500);
    }

    return c.json({ ok: true, schedule: toStore });
  },
);
