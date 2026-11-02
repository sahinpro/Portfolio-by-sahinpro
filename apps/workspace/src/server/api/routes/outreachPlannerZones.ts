import { Hono } from "hono";

import { getSupabaseServiceClient } from "@/server/lib/supabaseService";
import { SITE_SETTING_PLANNER_ZONES_KEY } from "@/server/outreach/types";
import { sanitizePlannerZones } from "@/server/outreach/zonesConfig";

import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `GET`/`PUT /api/admin/outreach-planner-zones`.
 *
 * Ported from the pre-monorepo Next.js route handler: 401 → 503 → 400/500,
 * `{ outreachZones }` on GET and `{ ok, outreachZones }` on PUT, storing the
 * `outreach_planner_zones` site setting with the service-role client.
 */
export const outreachPlannerZonesRoutes = new Hono<ApiEnv>();

outreachPlannerZonesRoutes.get(
  "/admin/outreach-planner-zones",
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
      .eq("key", SITE_SETTING_PLANNER_ZONES_KEY)
      .maybeSingle();

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    let outreachZones: Record<string, string> = {};
    if (data?.value) {
      try {
        outreachZones = sanitizePlannerZones(JSON.parse(data.value));
      } catch {
        outreachZones = {};
      }
    }

    return c.json({ outreachZones });
  },
);

type PutBody = { outreachZones?: Record<string, string> };

outreachPlannerZonesRoutes.put(
  "/admin/outreach-planner-zones",
  requireAdminBearer,
  async (c) => {
    const client = getSupabaseServiceClient();
    if (!client) {
      return c.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured" },
        503,
      );
    }

    let body: PutBody = {};
    try {
      body = (await c.req.json()) as PutBody;
    } catch {
      return c.json({ error: "Invalid JSON" }, 400);
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
      return c.json({ error: error.message }, 500);
    }

    return c.json({ ok: true, outreachZones });
  },
);
