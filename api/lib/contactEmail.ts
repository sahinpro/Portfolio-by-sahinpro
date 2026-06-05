import {
  buildContactHtml,
  buildContactPlainText,
  buildContactSubject,
  buildTemplateVariables,
} from "./html";
import { sendViaResend } from "./resendClient";
import type { ContactSubmission } from "./types";

const DEFAULT_TO_EMAIL = "sahinweb@proton.me";
const DEFAULT_FROM_EMAIL = "Sahin Alam <contact@sahin.pro.bd>";

export async function sendContactEmail(
  submission: ContactSubmission,
  idempotencyKey: string,
): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const toEmail =
    process.env.CONTACT_NOTIFICATION_TO_EMAIL?.trim() ?? DEFAULT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_NOTIFICATION_FROM_EMAIL?.trim() ?? DEFAULT_FROM_EMAIL;
  const templateId = process.env.RESEND_CONTACT_TEMPLATE_ID?.trim();

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const subject = buildContactSubject(submission);

  await sendViaResend({
    apiKey: resendApiKey,
    from: fromEmail,
    to: toEmail,
    replyTo: submission.email,
    subject,
    html: buildContactHtml(submission),
    text: buildContactPlainText(submission),
    idempotencyKey,
    templateId: templateId || undefined,
    templateVariables: templateId
      ? buildTemplateVariables(submission)
      : undefined,
  });
}
