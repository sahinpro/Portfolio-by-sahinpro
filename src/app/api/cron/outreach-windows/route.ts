import { isCronAuthorized } from "../../../../../api/lib/cronAuth";
import { runOutreachWindowNotifications } from "../../../../../api/lib/outreach/runOutreachNotifications";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const result = await runOutreachWindowNotifications(new Date());
  const status = result.failed.length > 0 ? 207 : 200;
  return NextResponse.json(result, { status });
}
