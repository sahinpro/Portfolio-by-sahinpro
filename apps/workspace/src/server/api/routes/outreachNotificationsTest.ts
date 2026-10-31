import { Hono } from "hono";

import { OUTREACH_MARKETS } from "@/server/outreach/marketsData";
import {
  buildOutreachHtml,
  buildOutreachPlainText,
  buildOutreachSubject,
  sendOutreachWindowEmail,
} from "@/server/outreach/outreachEmail";
import { buildTestMatch } from "@/server/outreach/runOutreachNotifications";
import type { OutreachZoneTarget } from "@/server/outreach/types";

import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `POST /api/admin/outreach-notifications/test`.
 *
 * Ported from the pre-monorepo Next.js route handler: 401 → tolerant JSON body →
 * `400` unknown zone / invalid timestamp → `preview` returns the rendered email,
 * `send` dispatches via Resend (test mode) or answers `502 { error }`. Request
 * and response contracts are byte-for-byte unchanged.
 */
export const outreachNotificationsTestRoutes = new Hono<ApiEnv>();

type TestBody = {
  mode?: "preview" | "send";
  marketId?: string;
  tz?: string;
  at?: string;
};

function resolveZone(body: TestBody): OutreachZoneTarget | null {
  const market =
    OUTREACH_MARKETS.find((m) => m.id === body.marketId) ?? OUTREACH_MARKETS[0];
  const tz = body.tz?.trim();
  const zone = tz ? market.zones.find((z) => z.tz === tz) : market.zones[0];
  if (!zone) return null;
  return {
    marketId: market.id,
    marketName: market.name,
    flag: market.flag,
    zoneId: zone.id,
    city: zone.city,
    tz: zone.tz,
  };
}

outreachNotificationsTestRoutes.post(
  "/admin/outreach-notifications/test",
  requireAdminBearer,
  async (c) => {
    let body: TestBody = {};
    try {
      body = (await c.req.json()) as TestBody;
    } catch {
      body = {};
    }

    const zone = resolveZone(body);
    if (!zone) {
      return c.json({ error: "Unknown time zone" }, 400);
    }

    const at = body.at?.trim() ? new Date(body.at) : new Date();
    if (Number.isNaN(at.getTime())) {
      return c.json({ error: "Invalid at timestamp" }, 400);
    }

    const match = buildTestMatch(zone, at);
    const mode = body.mode === "send" ? "send" : "preview";

    if (mode === "preview") {
      return c.json({
        mode: "preview",
        subject: buildOutreachSubject(match, true),
        text: buildOutreachPlainText(match, true),
        html: buildOutreachHtml(match, true),
        match,
      });
    }

    try {
      const { id } = await sendOutreachWindowEmail(match, { testMode: true });
      return c.json({
        mode: "send",
        ok: true,
        resendId: id,
        subject: buildOutreachSubject(match, true),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Send failed";
      return c.json({ error: message }, 502);
    }
  },
);
