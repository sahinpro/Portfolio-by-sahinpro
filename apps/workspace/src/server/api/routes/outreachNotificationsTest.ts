import { Hono } from "hono";

import {
  buildDigestHtml,
  buildDigestPlainText,
  buildDigestSubject,
  sendDailyOutreachDigestEmail,
} from "@/server/outreach/outreachEmail";
import { buildDigestForPreview } from "@/server/outreach/runOutreachNotifications";

import { requireAdminBearer } from "../middleware/requireAdminBearer";
import type { ApiEnv } from "../types";

/**
 * `POST /api/admin/outreach-notifications/test`.
 *
 * Renders or sends the ONE Daily Outreach Digest for preview purposes. `mode`
 * defaults to `preview` (never touches Resend, never touches the production
 * daily claim). `send` dispatches a real test email via Resend (test-mode
 * idempotency key) but STILL neither claims nor records a production
 * notification, so previewing cannot consume or duplicate the day's digest.
 * Optional `at` (ISO timestamp) lets the operator preview the digest as if it
 * ran at another moment.
 */
export const outreachNotificationsTestRoutes = new Hono<ApiEnv>();

type TestBody = {
  mode?: "preview" | "send";
  at?: string;
};

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

    const at = body.at?.trim() ? new Date(body.at) : new Date();
    if (Number.isNaN(at.getTime())) {
      return c.json({ error: "Invalid at timestamp" }, 400);
    }

    const model = await buildDigestForPreview(at);
    const mode = body.mode === "send" ? "send" : "preview";

    if (mode === "preview") {
      return c.json({
        mode: "preview",
        subject: buildDigestSubject(model, true),
        text: buildDigestPlainText(model, true),
        html: buildDigestHtml(model, true),
        windowCount: model.total,
        marketCount: model.marketCount,
        bdDate: model.bdDateKey,
      });
    }

    try {
      const { id } = await sendDailyOutreachDigestEmail(model, {
        testMode: true,
      });
      return c.json({
        mode: "send",
        ok: true,
        resendId: id,
        subject: buildDigestSubject(model, true),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Send failed";
      return c.json({ error: message }, 502);
    }
  },
);
