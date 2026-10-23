import { escapeHtml } from "../html";
import { sendViaResend } from "../resendClient";
import { formatLocalDateTime, tzParts } from "../timezone";
import type { WindowOpenMatch } from "./windowScheduler";

const LOGO_URL = "https://www.sahinpro.me/sahin.jpg";
/** Canonical production origin, used when no env override is configured. */
const DEFAULT_SITE_URL = "https://www.sahinpro.me";

/**
 * Base production origin for email links.
 *
 * Deliberately NEVER falls back to `VERCEL_URL`: Vercel auto-injects it with
 * the unique per-deployment URL (e.g. `portfolio-by-sahinpro-<hash>-…
 * vercel.app`), which goes stale when that deployment is removed. Server-side
 * `SITE_URL` is the canonical override; `NEXT_PUBLIC_SITE_URL` is accepted as
 * a legacy fallback. No secrets or tokens are ever embedded in the link.
 */
export function siteBaseUrl(): string {
  const raw =
    process.env.SITE_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    DEFAULT_SITE_URL;
  const withScheme = raw.startsWith("http") ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, "");
}

export function leadsAdminUrl(): string {
  return `${siteBaseUrl()}/admin/leads`;
}

function notificationEmails(): { to: string; from: string; apiKey: string } {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim();
  const from =
    process.env.CONTACT_NOTIFICATION_FROM_EMAIL?.trim() ??
    "Sahin Alam <contact@sahinpro.me>";

  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  if (!to) throw new Error("CONTACT_NOTIFICATION_TO_EMAIL is not configured");

  return { apiKey, to, from };
}

export function buildOutreachSubject(
  match: WindowOpenMatch,
  testMode: boolean,
): string {
  const label = `${match.zone.marketName} · ${match.zone.city}`;
  const prefix = testMode ? "[TEST] " : "";
  return `${prefix}🌍 Outreach Window Open — ${label}`;
}

export function buildOutreachPlainText(
  match: WindowOpenMatch,
  testMode: boolean,
  windowStart: string = "09:30",
): string {
  const parts = tzParts(match.zone.tz);
  const localStamp = formatLocalDateTime(parts);
  const lines = [
    testMode
      ? "TEST — Outreach window reminder"
      : "Scheduled outreach window reminder",
    "",
    `Market: ${match.zone.flag} ${match.zone.marketName}`,
    `City / time zone: ${match.zone.city} (${match.zone.tz})`,
    `Local date & time: ${localStamp}`,
    `Recommended window: ${windowStart} local time`,
    `Bangladesh equivalent: ${match.bdWindowLabel}`,
    "",
    "This is a scheduled reminder for you — not an automated message to prospects.",
    "Review your Leads page and reach out to suitable prospects while the window is open.",
    "",
    `Leads: ${leadsAdminUrl()}`,
  ];
  return lines.join("\n");
}

export function buildOutreachHtml(
  match: WindowOpenMatch,
  testMode: boolean,
  windowStart: string = "09:30",
): string {
  const parts = tzParts(match.zone.tz);
  const localStamp = formatLocalDateTime(parts);
  const subject = buildOutreachSubject(match, testMode);
  const leadsUrl = leadsAdminUrl();
  const banner = testMode
    ? "Test outreach reminder — delivery only, schedule unchanged."
    : "Scheduled reminder — not sent to any prospect.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    Outreach window is open for ${escapeHtml(match.zone.marketName)}.
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
          <tr>
            <td style="padding-bottom:16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="56" valign="middle" style="padding-right:14px;">
                    <img src="${LOGO_URL}" alt="Sahin Alam" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:2px solid #e5e7eb;object-fit:cover;" />
                  </td>
                  <td valign="middle">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Outreach Time Planner</p>
                    <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">${escapeHtml(banner)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
                <tr><td style="height:4px;background-color:#059669;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:28px 32px 20px;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 8px;font-size:11px;color:#059669;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">Window open</p>
                    <h1 style="margin:0 0 10px;font-size:22px;line-height:1.35;color:#111827;font-weight:700;">${escapeHtml(match.zone.flag)} ${escapeHtml(match.zone.marketName)}</h1>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#6b7280;">${escapeHtml(match.zone.city)} · <code style="font-size:13px;color:#374151;">${escapeHtml(match.zone.tz)}</code></p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 32px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:6px;font-size:14px;line-height:1.6;color:#374151;">
                      <tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;"><strong>Local now:</strong> ${escapeHtml(localStamp)}</td></tr>
                      <tr><td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;"><strong>Recommended window:</strong> ${escapeHtml(windowStart)} local</td></tr>
                      <tr><td style="padding:12px 16px;"><strong>Bangladesh time:</strong> ${escapeHtml(match.bdWindowLabel)}</td></tr>
                    </table>
                    <p style="margin:20px 0 0;font-size:14px;line-height:1.65;color:#4b5563;">
                      Review the Leads page and contact suitable prospects while this window is active.
                      This email is only for you — prospects are not messaged automatically.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 32px 28px;border-top:1px solid #f3f4f6;">
                    <a href="${escapeHtml(leadsUrl)}" style="display:inline-block;padding:12px 24px;background-color:#059669;border-radius:6px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Open Leads</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function outreachIdempotencyKey(
  match: WindowOpenMatch,
  testMode: boolean,
  windowStart: string = "0930",
): string {
  if (testMode) {
    return `outreach-test-${match.zone.tz}-${Date.now()}`;
  }
  const compact = windowStart.replace(":", "");
  return `outreach-${match.zone.tz}-${match.localDate}-${compact}`;
}

export async function sendOutreachWindowEmail(
  match: WindowOpenMatch,
  options: { testMode?: boolean; scheduleStartLabel?: string } = {},
): Promise<{ id: string }> {
  const testMode = options.testMode === true;
  const windowStart = options.scheduleStartLabel ?? "09:30";
  const { apiKey, to, from } = notificationEmails();
  const subject = buildOutreachSubject(match, testMode);
  const html = buildOutreachHtml(match, testMode, windowStart);
  const text = buildOutreachPlainText(match, testMode, windowStart);

  return sendViaResend({
    apiKey,
    from,
    to,
    subject,
    html,
    text,
    idempotencyKey: outreachIdempotencyKey(match, testMode, windowStart),
    tag: testMode ? "outreach-window-test" : "outreach-window-reminder",
  });
}
