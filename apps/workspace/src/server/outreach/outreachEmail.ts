import { escapeHtml } from "../lib/html";
import { sendViaResend } from "../lib/resendClient";
import type { DigestModel, DigestWindow } from "./types";

const LOGO_URL = "https://sahinpro.me/sahin.jpg";

/**
 * Brand accent (emerald) carried over from the previous Outreach Time Planner
 * reminder template so the digest stays visually consistent with the planner.
 * All derived tints reference this one hue; there is exactly one accent.
 */
const ACCENT = "#059669";
const ACCENT_DARK = "#047857";
const ACCENT_TINT = "#ecfdf5";
const INK = "#0f172a";
const INK_SOFT = "#475569";
const INK_MUTED = "#94a3b8";
const HAIRLINE = "#e6eaf0";

/**
 * Canonical production origin for email links, used when no env override is
 * configured. This is the Workspace origin because the Lead CRM (and the
 * `/leads` board this email deep-links to) lives in this app after the
 * three-app split — the Website no longer serves the admin CRM.
 */
const DEFAULT_SITE_URL = "https://workspace.sahinpro.me";

/**
 * Base production origin for email links.
 *
 * Deliberately NEVER falls back to `VERCEL_URL`: Vercel auto-injects it with
 * the unique per-deployment URL, which goes stale when that deployment is
 * removed. Server-side `SITE_URL` is the canonical override;
 * `NEXT_PUBLIC_SITE_URL` is accepted as a legacy fallback. No secrets or tokens
 * are ever embedded in the link.
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
  // The Lead CRM moved to this Workspace app; its board lives at `/leads` on
  // this origin. `SITE_URL` is set to the workspace origin in deployment, so
  // links resolve to workspace…/leads.
  return `${siteBaseUrl()}/leads`;
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

// ---------------------------------------------------------------------------
// Subject + plain text
// ---------------------------------------------------------------------------

export function buildDigestSubject(
  model: DigestModel,
  testMode: boolean,
): string {
  const prefix = testMode ? "[TEST] " : "";
  const base =
    model.total > 0
      ? "Your Outreach Windows — Daily Summary"
      : "No Outreach Windows Today — Daily Summary";
  return `${prefix}${base}`;
}

function plainTextWindow(window: DigestWindow): string[] {
  return [
    `• ${window.zone.flag} ${window.zone.marketName} — ${window.zone.city}`,
    `  Bangladesh: ${window.bdDayLabel}, ${window.bdTimeLabel}  ·  ` +
      `Local: ${window.localDayLabel} ${window.localTimeLabel} (${window.tzAbbrev}, ${window.tz})`,
  ];
}

export function buildDigestPlainText(
  model: DigestModel,
  testMode: boolean,
): string {
  const leadsUrl = leadsAdminUrl();
  const lines: string[] = [
    testMode
      ? "TEST — Daily Outreach Digest (delivery only)"
      : "Daily Outreach Digest",
    "",
    "Your Daily Outreach Brief",
    `Your next 24 hours of outreach opportunities — ${model.bdDateLabel} (${model.bdTimeLabel} Bangladesh time).`,
    "",
  ];

  if (model.total === 0) {
    lines.push("No outreach windows are scheduled in the next 24 hours.", "");
  } else {
    lines.push(
      `Upcoming opportunities: ${model.total}`,
      `Markets: ${model.marketCount}`,
    );
    if (model.next) {
      lines.push(
        `Next window: ${model.next.bdDayLabel}, ${model.next.bdTimeLabel} Bangladesh time${
          model.nextCountdownLabel ? ` (${model.nextCountdownLabel})` : ""
        }.`,
      );
    }
    lines.push("");

    for (const group of model.groups) {
      lines.push(`${group.bdDayLabel} — ${group.bdDateLabel} (Bangladesh)`);
      for (const window of group.windows) {
        lines.push(...plainTextWindow(window));
      }
      lines.push("");
    }

    if (model.next) {
      lines.push(
        "Next opportunity",
        `${model.next.zone.marketName} · ${model.next.zone.city}`,
        `Opens ${model.next.bdDayLabel}, ${model.next.bdTimeLabel} Bangladesh time · ` +
          `${model.next.localDayLabel} ${model.next.localTimeLabel} local (${model.next.tzAbbrev})`,
        model.nextCountdownLabel
          ? `Time remaining: ${model.nextCountdownLabel}`
          : "",
        "",
      );
    }
  }

  lines.push(
    testMode ? "Open Leads (test): " + leadsUrl : "Open Leads: " + leadsUrl,
    "",
    "This is your personal outreach reminder. No messages are sent to prospects automatically.",
  );

  return lines.filter((line) => line !== null).join("\n");
}

// ---------------------------------------------------------------------------
// Premium HTML mini-dashboard
// ---------------------------------------------------------------------------

function metricCard(value: string, label: string): string {
  return `<td width="33.33%" valign="top" style="padding:0 5px;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border:1px solid ${HAIRLINE};border-radius:12px;box-shadow:0 1px 2px rgba(16,24,40,0.06);">
      <tr><td align="center" style="padding:14px 8px 12px;">
        <p style="margin:0;font-size:20px;line-height:1.1;font-weight:700;color:${ACCENT_DARK};">${escapeHtml(value)}</p>
        <p style="margin:6px 0 0;font-size:11px;line-height:1.3;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${escapeHtml(label)}</p>
      </td></tr>
    </table>
  </td>`;
}

function scheduleRow(window: DigestWindow, isNext: boolean): string {
  const accentBar = isNext
    ? `border-left:4px solid ${ACCENT};background-color:${ACCENT_TINT};`
    : `border-left:4px solid transparent;background-color:#ffffff;`;
  const shadow =
    "box-shadow:0 1px 2px rgba(16,24,40,0.05),0 1px 3px rgba(16,24,40,0.06);";
  const nextPill = isNext
    ? `<span style="display:inline-block;margin-top:4px;padding:2px 7px;border-radius:9999px;background-color:${ACCENT};color:#ffffff;font-size:9px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Next</span>`
    : "";

  return `<tr>
    <td style="padding:0 0 8px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" class="row" style="border-collapse:separate;border-radius:10px;${accentBar}${shadow}">
        <tr>
          <td class="c c-bd" valign="top" width="34%" style="padding:12px 10px 12px 14px;">
            <span class="lbl">Bangladesh</span>
            <p class="lbl-sp" style="margin:0 0 4px;font-size:10px;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">${escapeHtml(window.bdDayLabel)}</p>
            <p style="margin:0;font-size:16px;font-weight:700;color:${ACCENT_DARK};line-height:1.15;">${escapeHtml(window.bdTimeLabel)}</p>
          </td>
          <td class="c c-market" valign="top" width="30%" style="padding:12px 10px;">
            <span class="lbl">Market / City</span>
            <p style="margin:0;font-size:13px;font-weight:700;color:${INK};line-height:1.3;">${window.zone.flag} ${escapeHtml(window.zone.marketName)}</p>
            <p style="margin:2px 0 0;font-size:12px;color:${INK_SOFT};line-height:1.3;">${escapeHtml(window.zone.city)}</p>
            ${nextPill ? `<div style="margin-top:4px;">${nextPill}</div>` : ""}
          </td>
          <td class="c c-local" valign="top" width="20%" style="padding:12px 10px;">
            <span class="lbl">Local time</span>
            <p style="margin:0;font-size:13px;font-weight:600;color:${INK};line-height:1.3;">${escapeHtml(window.localTimeLabel)}</p>
            <p style="margin:2px 0 0;font-size:11px;color:${INK_MUTED};">${escapeHtml(window.localDayLabel)}</p>
          </td>
          <td class="c c-tz" valign="top" width="16%" style="padding:12px 14px 12px 10px;">
            <span class="lbl">Timezone</span>
            <p style="margin:0;font-size:12px;font-weight:600;color:${INK_SOFT};line-height:1.3;">${escapeHtml(window.tzAbbrev)}</p>
            <p style="margin:2px 0 0;font-size:10px;color:${INK_MUTED};line-height:1.3;word-break:break-word;">${escapeHtml(window.tz)}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

function groupDivider(
  model: DigestModel,
  bdDayLabel: string,
  bdDateLabel: string,
): string {
  const crossesMidnight = model.groups.length > 1;
  const datePart = crossesMidnight ? ` · ${escapeHtml(bdDateLabel)}` : "";
  return `<tr>
    <td style="padding:12px 2px 6px;">
      <p style="margin:0;font-size:11px;font-weight:700;color:${INK_SOFT};text-transform:uppercase;letter-spacing:0.08em;">${escapeHtml(bdDayLabel)}${datePart}</p>
    </td>
  </tr>`;
}

function highlightCard(model: DigestModel): string {
  const w = model.next;
  if (!w) return "";
  return `<tr>
    <td style="padding:6px 0 0;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid ${ACCENT};border-left:5px solid ${ACCENT};border-radius:12px;background-color:${ACCENT_TINT};box-shadow:0 2px 4px rgba(4,120,87,0.10);">
        <tr><td style="padding:18px 20px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:${ACCENT_DARK};text-transform:uppercase;letter-spacing:0.10em;">Next opportunity · ${escapeHtml(w.bdDayLabel)}</p>
          <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:${INK};line-height:1.3;">${w.zone.flag} ${escapeHtml(w.zone.marketName)}</p>
          <p style="margin:0 0 12px;font-size:13px;color:${INK_SOFT};">${escapeHtml(w.zone.city)}</p>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0"><tr>
            <td valign="top" style="padding-right:28px;">
              <p style="margin:0;font-size:10px;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Bangladesh opens</p>
              <p style="margin:2px 0 0;font-size:16px;font-weight:700;color:${ACCENT_DARK};">${escapeHtml(w.bdTimeLabel)}</p>
            </td>
            <td valign="top" style="padding-right:28px;">
              <p style="margin:0;font-size:10px;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Local time</p>
              <p style="margin:2px 0 0;font-size:16px;font-weight:700;color:${INK};">${escapeHtml(w.localTimeLabel)} ${escapeHtml(w.tzAbbrev)}</p>
            </td>
            <td valign="top">
              <p style="margin:0;font-size:10px;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;font-weight:600;">Time remaining</p>
              <p style="margin:2px 0 0;font-size:16px;font-weight:700;color:${INK};">${escapeHtml(model.nextCountdownLabel ?? "")}</p>
            </td>
          </tr></table>
        </td></tr>
      </table>
    </td>
  </tr>`;
}

function emptyState(): string {
  return `<tr>
    <td align="center" style="padding:32px 24px;">
      <p style="margin:0 0 6px;font-size:16px;font-weight:700;color:${INK};">No windows in the next 24 hours</p>
      <p style="margin:0;font-size:13px;line-height:1.6;color:${INK_SOFT};">None of your enabled markets open a scheduled outreach window today. Your planner settings are unchanged.</p>
    </td>
  </tr>`;
}

export function buildDigestHtml(model: DigestModel, testMode: boolean): string {
  const subject = buildDigestSubject(model, testMode);
  const leadsUrl = leadsAdminUrl();
  const banner = testMode
    ? "Test digest — delivery only, schedule unchanged."
    : "Personal reminder · never sent to prospects";

  let scheduleRows = "";
  for (const group of model.groups) {
    scheduleRows += groupDivider(model, group.bdDayLabel, group.bdDateLabel);
    for (const window of group.windows) {
      scheduleRows += scheduleRow(window, window === model.next);
    }
  }

  const summaryRow =
    model.total > 0
      ? `<tr>
        <td style="padding:20px 24px 4px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              ${metricCard(String(model.total), "Opportunities")}
              ${metricCard(String(model.marketCount), "Markets")}
              ${metricCard(
                model.next ? `${model.next.bdTimeLabel}` : "—",
                model.next ? `Next · ${model.next.bdDayLabel}` : "Next",
              )}
            </tr>
          </table>
        </td>
      </tr>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(subject)}</title>
  <style>
    /* Progressive enhancement only. Every label and value is present in the
       markup, so the email stays fully readable if this block is stripped. */
    .lbl { display: none; }
    @media only screen and (max-width:480px) {
      .hide-sm { display: none !important; }
      .row td.c { display: block !important; width: 100% !important; padding: 6px 14px !important; }
      .row td.c-bd { padding-top: 12px !important; }
      .row td.c-tz { padding-bottom: 12px !important; }
      .lbl { display: block !important; font-size: 10px; color: ${INK_MUTED}; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; margin-bottom: 2px; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#eef1f5;font-family:Arial,Helvetica,sans-serif;color:${INK};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${
      model.total > 0
        ? `${model.total} outreach ${model.total === 1 ? "window" : "windows"} in the next 24 hours. Next: ${escapeHtml(model.next ? `${model.next.zone.marketName}, ${model.next.bdDayLabel} ${model.next.bdTimeLabel} Bangladesh` : "")}.`
        : "No outreach windows scheduled in the next 24 hours."
    }
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#eef1f5;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;">

          <!-- A. Hero / header card -->
          <tr>
            <td style="background-color:${ACCENT_DARK};background-image:linear-gradient(135deg,${ACCENT_DARK} 0%,${ACCENT} 55%,#10b981 100%);border-radius:16px 16px 0 0;box-shadow:0 6px 16px rgba(4,120,87,0.22);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding:26px 28px 8px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="44" valign="middle" style="padding-right:12px;">
                          <img src="${LOGO_URL}" alt="Sahin Alam" width="40" height="40" style="display:block;width:40px;height:40px;border-radius:50%;border:2px solid rgba(255,255,255,0.6);object-fit:cover;" />
                        </td>
                        <td valign="middle">
                          <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.10em;text-transform:uppercase;color:rgba(255,255,255,0.82);">Outreach Time Planner</p>
                        </td>
                        <td align="right" valign="middle">
                          <p class="hide-sm" style="margin:0;font-size:11px;color:rgba(255,255,255,0.78);">${escapeHtml(banner)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 28px 24px;">
                    <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;color:#ffffff;font-weight:700;">Your Daily Outreach Brief</h1>
                    <p style="margin:0 0 14px;font-size:14px;line-height:1.55;color:rgba(255,255,255,0.9);">Your next 24 hours of outreach opportunities.</p>
                    <span style="display:inline-block;padding:6px 12px;border-radius:9999px;background-color:rgba(255,255,255,0.16);border:1px solid rgba(255,255,255,0.28);font-size:12px;font-weight:600;color:#ffffff;">${escapeHtml(model.bdDateLabel)} · ${escapeHtml(model.bdTimeLabel)} Bangladesh</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card: summary + schedule + highlight + CTA -->
          <tr>
            <td style="background-color:#ffffff;border-left:1px solid ${HAIRLINE};border-right:1px solid ${HAIRLINE};box-shadow:0 8px 20px rgba(16,24,40,0.06);">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${summaryRow}

                <!-- C. Main schedule -->
                <tr>
                  <td style="padding:20px 24px 6px;">
                    <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:${INK};">Schedule — next 24 hours</p>
                    <p style="margin:0;font-size:12px;color:${INK_MUTED};">Sorted by Bangladesh time · opening ${escapeHtml(model.windowStartLabel)} local in each market.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 24px 8px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td width="34%" style="padding:0 10px 6px 14px;"><p style="margin:0;font-size:10px;font-weight:700;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;">Bangladesh</p></td>
                        <td width="30%" style="padding:0 10px 6px;"><p style="margin:0;font-size:10px;font-weight:700;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;">Market / City</p></td>
                        <td width="20%" style="padding:0 10px 6px;"><p class="hide-sm" style="margin:0;font-size:10px;font-weight:700;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;">Local</p></td>
                        <td width="16%" style="padding:0 14px 6px 10px;"><p class="hide-sm" style="margin:0;font-size:10px;font-weight:700;color:${INK_MUTED};text-transform:uppercase;letter-spacing:0.06em;">TZ</p></td>
                      </tr>
                      ${model.total > 0 ? scheduleRows : emptyState()}
                    </table>
                  </td>
                </tr>

                <!-- D. Next opportunity highlight -->
                <tr><td style="padding:8px 24px 0;">${model.total > 0 ? highlightCard(model) : ""}</td></tr>

                <!-- E. Primary action -->
                <tr>
                  <td align="center" style="padding:24px 24px 28px;">
                    <a href="${escapeHtml(leadsUrl)}" style="display:inline-block;padding:13px 30px;background-color:${ACCENT};border-radius:8px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;box-shadow:0 4px 10px rgba(4,120,87,0.25);">Open Leads</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- F. Footer -->
          <tr>
            <td style="background-color:#f8fafc;border:1px solid ${HAIRLINE};border-top:none;border-radius:0 0 16px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr><td align="center" style="padding:16px 24px;">
                  <p style="margin:0 0 4px;font-size:12px;line-height:1.6;color:${INK_SOFT};">This is your personal outreach reminder. No messages are sent to prospects automatically.</p>
                  <p style="margin:0;font-size:11px;color:${INK_MUTED};">Outreach Time Planner · generated ${escapeHtml(model.bdDateLabel)}, ${escapeHtml(model.bdTimeLabel)} Bangladesh</p>
                </td></tr>
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

// ---------------------------------------------------------------------------
// Idempotency + send
// ---------------------------------------------------------------------------

/**
 * Daily digest idempotency key. Production keys are deterministic per
 * Bangladesh calendar day — `outreach-digest/asia-dhaka/YYYY-MM-DD` — so every
 * retry of the same day (including after a network timeout or an ambiguous
 * provider response) re-presents the SAME key inside Resend's 24h idempotency
 * window and is deduped into a single send. The key never changes between
 * attempts and is never randomized; it changes only when the Bangladesh date
 * rolls over. Test keys stay unique per call so preview sends never collide
 * with (or suppress) the daily production digest.
 */
export function digestIdempotencyKey(
  model: DigestModel,
  testMode: boolean,
): string {
  if (testMode) {
    return `outreach-digest-test-${Date.now()}`;
  }
  return `outreach-digest/asia-dhaka/${model.bdDateKey}`;
}

export async function sendDailyOutreachDigestEmail(
  model: DigestModel,
  options: { testMode?: boolean } = {},
): Promise<{ id: string }> {
  const testMode = options.testMode === true;
  const { apiKey, to, from } = notificationEmails();
  const subject = buildDigestSubject(model, testMode);
  const html = buildDigestHtml(model, testMode);
  const text = buildDigestPlainText(model, testMode);

  return sendViaResend({
    apiKey,
    from,
    to,
    subject,
    html,
    text,
    idempotencyKey: digestIdempotencyKey(model, testMode),
    tag: testMode ? "outreach-daily-digest-test" : "outreach-daily-digest",
  });
}
