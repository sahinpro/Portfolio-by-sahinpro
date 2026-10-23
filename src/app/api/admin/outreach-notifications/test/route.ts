import { isAuthorizedAdmin } from "../../../../../../api/_lib/adminRouteAuth";
import { OUTREACH_MARKETS } from "../../../../../../api/_lib/outreach/marketsData";
import {
  buildOutreachHtml,
  buildOutreachPlainText,
  buildOutreachSubject,
  sendOutreachWindowEmail,
} from "../../../../../../api/_lib/outreach/outreachEmail";
import { buildTestMatch } from "../../../../../../api/_lib/outreach/runOutreachNotifications";
import type { OutreachZoneTarget } from "../../../../../../api/_lib/outreach/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type TestBody = {
  mode?: "preview" | "send";
  marketId?: string;
  tz?: string;
  at?: string;
};

function resolveZone(body: TestBody): OutreachZoneTarget | null {
  const market =
    OUTREACH_MARKETS.find((m) => m.id === body.marketId) ??
    OUTREACH_MARKETS[0];
  const tz = body.tz?.trim();
  const zone = tz
    ? market.zones.find((z) => z.tz === tz)
    : market.zones[0];
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

export async function POST(request: Request) {
  if (!(await isAuthorizedAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TestBody = {};
  try {
    body = (await request.json()) as TestBody;
  } catch {
    body = {};
  }

  const zone = resolveZone(body);
  if (!zone) {
    return NextResponse.json({ error: "Unknown time zone" }, { status: 400 });
  }

  const at = body.at?.trim() ? new Date(body.at) : new Date();
  if (Number.isNaN(at.getTime())) {
    return NextResponse.json({ error: "Invalid at timestamp" }, { status: 400 });
  }

  const match = buildTestMatch(zone, at);
  const mode = body.mode === "send" ? "send" : "preview";

  if (mode === "preview") {
    return NextResponse.json({
      mode: "preview",
      subject: buildOutreachSubject(match, true),
      text: buildOutreachPlainText(match, true),
      html: buildOutreachHtml(match, true),
      match,
    });
  }

  try {
    const { id } = await sendOutreachWindowEmail(match, { testMode: true });
    return NextResponse.json({
      mode: "send",
      ok: true,
      resendId: id,
      subject: buildOutreachSubject(match, true),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
