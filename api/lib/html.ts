import type { ContactSubmission } from "./types";

const LOGO_URL = "https://www.sahinpro.me/sahin.jpg";
const ICON_BASE = "https://www.sahinpro.me/email/icons";

export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

export function buildContactSubject(submission: ContactSubmission): string {
  return submission.subject?.trim()
    ? `New inquiry: ${submission.subject.trim()}`
    : `New inquiry from ${submission.name}`;
}

export function buildContactPlainText(submission: ContactSubmission): string {
  return [
    "New portfolio contact submission",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone ?? "Not provided"}`,
    `Budget: ${submission.budget}`,
    `Subject: ${submission.subject ?? "Not provided"}`,
    "",
    "Message:",
    submission.message,
    "",
    "Source: www.sahinpro.me/contact",
  ].join("\n");
}

export function buildContactHtml(submission: ContactSubmission): string {
  const subjectLine = buildContactSubject(submission);
  const previewLine = submission.subject?.trim()
    ? `${submission.name} sent a new inquiry about "${submission.subject.trim()}".`
    : `${submission.name} sent a new portfolio inquiry.`;
  const submittedAt = new Date().toUTCString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subjectLine)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
    ${escapeHtml(previewLine)}
  </div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f4f5f7;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:620px;">
          <tr>
            <td style="padding-bottom:20px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="56" valign="middle" style="padding-right:14px;">
                    <img src="${LOGO_URL}" alt="Sahin Alam" width="48" height="48" style="display:block;width:48px;height:48px;border-radius:50%;border:2px solid #e5e7eb;object-fit:cover;" />
                  </td>
                  <td valign="middle">
                    <p style="margin:0;font-size:18px;font-weight:700;color:#111827;">Sahin Alam</p>
                    <p style="margin:3px 0 0;font-size:12px;color:#6b7280;">Full Stack Developer · www.sahinpro.me</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
                <tr><td style="height:4px;background-color:#4f46e5;font-size:0;line-height:0;">&nbsp;</td></tr>
                <tr>
                  <td style="padding:36px 40px 28px;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0 0 10px;font-size:11px;color:#4f46e5;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">New Client Inquiry</p>
                    <h1 style="margin:0 0 12px;font-size:24px;line-height:1.3;color:#111827;font-weight:700;">${escapeHtml(submission.subject?.trim() || "General inquiry")}</h1>
                    <p style="margin:0;font-size:15px;line-height:1.6;color:#6b7280;">Submitted by <strong style="color:#111827;">${escapeHtml(submission.name)}</strong>.</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 40px;background-color:#fafafa;border-bottom:1px solid #f3f4f6;">
                    <p style="margin:0;font-size:14px;color:#374151;font-weight:600;">Received: ${escapeHtml(submittedAt)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:28px 40px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:6px;">
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
                          <img src="${ICON_BASE}/user.svg" alt="" width="18" height="18" style="vertical-align:middle;margin-right:8px;" />
                          <strong>Name:</strong> ${escapeHtml(submission.name)}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
                          <img src="${ICON_BASE}/email.svg" alt="" width="18" height="18" style="vertical-align:middle;margin-right:8px;" />
                          <strong>Email:</strong> <a href="mailto:${escapeHtml(submission.email)}" style="color:#4f46e5;text-decoration:none;">${escapeHtml(submission.email)}</a>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;border-bottom:1px solid #e5e7eb;">
                          <img src="${ICON_BASE}/phone.svg" alt="" width="18" height="18" style="vertical-align:middle;margin-right:8px;" />
                          <strong>Phone:</strong> ${escapeHtml(submission.phone ?? "Not provided")}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;">
                          <img src="${ICON_BASE}/budget.svg" alt="" width="18" height="18" style="vertical-align:middle;margin-right:8px;" />
                          <strong>Budget:</strong> ${escapeHtml(submission.budget)}
                        </td>
                      </tr>
                    </table>
                    <p style="margin:24px 0 12px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.12em;font-weight:700;">
                      <img src="${ICON_BASE}/message.svg" alt="" width="18" height="18" style="vertical-align:middle;margin-right:6px;" />
                      Message
                    </p>
                    <div style="padding:22px 24px;background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;font-size:15px;line-height:1.75;color:#374151;">
                      ${nl2br(submission.message)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding:8px 40px 36px;border-top:1px solid #f3f4f6;">
                    <a href="mailto:${escapeHtml(submission.email)}" style="display:inline-block;padding:13px 28px;background-color:#4f46e5;border-radius:6px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Reply to Client</a>
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

export function buildTemplateVariables(submission: ContactSubmission): Record<string, string> {
  return {
    CLIENT_NAME: submission.name,
    CLIENT_EMAIL: submission.email,
    CLIENT_PHONE: submission.phone ?? "Not provided",
    INQUIRY_SUBJECT: submission.subject?.trim() || "General inquiry",
    BUDGET: submission.budget,
    MESSAGE: nl2br(submission.message),
    PREVIEW_TEXT: submission.subject?.trim()
      ? `${submission.name} sent a new inquiry about "${submission.subject.trim()}".`
      : `${submission.name} sent a new portfolio inquiry.`,
    SUBMITTED_AT: new Date().toUTCString(),
    LOGO_URL: LOGO_URL,
  };
}
