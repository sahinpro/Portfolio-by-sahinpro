import { Hono } from "hono";

import { getSupabaseServiceClient } from "@/server/lib/supabaseService";
import {
  SITE_SETTING_PLANNER_PREFS_KEY,
  SITE_SETTING_PLANNER_ZONES_KEY,
  type PlannerUiPreferences,
} from "@/server/outreach/types";
import {
  sanitizePlannerPrefs,
  sanitizePlannerZones,
} from "@/server/outreach/zonesConfig";

import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `GET`/`PUT /api/admin/outreach-planner-zones`.
 *
 * Ported from the pre-monorepo Next.js route handler: 401 → 503 → 400/500,
 * `{ outreachZones }` on GET and `{ ok, outreachZones }` on PUT, storing the
 * `outreach_planner_zones` site setting with the service-role client.
 *
 * The Outreach Time Planner is Supabase-only now (no browser IndexedDB), so the
 * route also owns the planner's UI preferences (`outreach_planner_prefs`:
 * market filter + expanded) in the same `site_settings` table. Both keys are
 * read/written together; `prefs` on PUT is optional so older callers that only
 * send zone picks keep working.
 */
export const outreachPlannerZonesRoutes = new Hono<ApiEnv>();

const DEFAULT_PREFS: PlannerUiPreferences = { marketFilter: "all", expanded: true };

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
      .select("key,value")
      .in("key", [SITE_SETTING_PLANNER_ZONES_KEY, SITE_SETTING_PLANNER_PREFS_KEY]);

    if (error) {
      return c.json({ error: error.message }, 500);
    }

    const rows = new Map<string, string>(
      (data ?? [])
        .filter((row: { key?: string; value?: string }) => row.key && row.value)
        .map((row: { key: string; value: string }) => [row.key, row.value]),
    );

    let outreachZones: Record<string, string> = {};
    const zonesRaw = rows.get(SITE_SETTING_PLANNER_ZONES_KEY);
    if (zonesRaw) {
      try {
        outreachZones = sanitizePlannerZones(JSON.parse(zonesRaw));
      } catch {
        outreachZones = {};
      }
    }

    let prefs: PlannerUiPreferences = DEFAULT_PREFS;
    const prefsRaw = rows.get(SITE_SETTING_PLANNER_PREFS_KEY);
    if (prefsRaw) {
      try {
        prefs = sanitizePlannerPrefs(JSON.parse(prefsRaw));
      } catch {
        prefs = DEFAULT_PREFS;
      }
    }

    return c.json({ outreachZones, prefs });
  },
);

type PutBody = {
  outreachZones?: Record<string, string>;
  prefs?: { marketFilter?: unknown; expanded?: unknown };
};

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

    // `prefs` is optional — zone-only callers (older builds) never touch it.
    let prefs = DEFAULT_PREFS;
    if (body.prefs !== undefined) {
      prefs = sanitizePlannerPrefs(body.prefs);
      const { error: prefsError } = await client.from("site_settings").upsert(
        {
          key: SITE_SETTING_PLANNER_PREFS_KEY,
          value: JSON.stringify(prefs),
        },
        { onConflict: "key" },
      );
      if (prefsError) {
        return c.json({ error: prefsError.message }, 500);
      }
    } else {
      // Report the stored prefs so the response matches what a GET would give.
      const { data } = await client
        .from("site_settings")
        .select("value")
        .eq("key", SITE_SETTING_PLANNER_PREFS_KEY)
        .maybeSingle();
      if (data?.value) {
        try {
          prefs = sanitizePlannerPrefs(JSON.parse(data.value));
        } catch {
          prefs = DEFAULT_PREFS;
        }
      }
    }

    return c.json({ ok: true, outreachZones, prefs });
  },
);
