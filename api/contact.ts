export const config = {
  runtime: "edge",
};

const DEFAULT_TO_EMAIL = "sahinweb@proton.me";
const DEFAULT_FROM_EMAIL = "Sahin Alam <contact@sahin.pro.bd>";

type ContactBody = Record<string, string | undefined>;

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function nl2br(value: string): string {
  return escapeHtml(value).replaceAll("\n", "<br />");
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function parseBody(raw: string | null): ContactBody {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ContactBody;
  } catch {
    return {};
  }
}

async function verifyTurnstile(secret: string, token: string): Promise<boolean> {
  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    },
  );
  const outcome = (await verify.json()) as { success?: boolean };
  return Boolean(outcome.success);
}

async function sendContactEmail(submission: {
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  budget: string;
  message: string;
}): Promise<void> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_NOTIFICATION_TO_EMAIL ?? DEFAULT_TO_EMAIL;
  const fromEmail =
    process.env.CONTACT_NOTIFICATION_FROM_EMAIL ?? DEFAULT_FROM_EMAIL;

  if (!resendApiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const subjectLine = submission.subject?.trim()
    ? `New contact: ${submission.subject.trim()}`
    : `New contact from ${submission.name}`;

  const previewLine = submission.subject?.trim()
    ? `${submission.name} sent a new inquiry about "${submission.subject.trim()}".`
    : `${submission.name} sent a new portfolio inquiry.`;

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#111827;">
    <h1>${escapeHtml(subjectLine)}</h1>
    <p>${escapeHtml(previewLine)}</p>
    <p><strong>Name:</strong> ${escapeHtml(submission.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(submission.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(submission.phone ?? "Not provided")}</p>
    <p><strong>Budget:</strong> ${escapeHtml(submission.budget)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(submission.subject ?? "Not provided")}</p>
    <p><strong>Message:</strong><br />${nl2br(submission.message)}</p>
  </body></html>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [toEmail],
      reply_to: submission.email,
      subject: subjectLine,
      html,
    }),
  });

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const payload = (await response.json()) as { message?: string };
      if (payload.message) detail = payload.message;
    } catch {
      /* ignore */
    }
    throw new Error(`Resend request failed: ${detail}`);
  }
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === "OPTIONS") {
    return jsonResponse({ ok: true });
  }

  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const body = parseBody(await request.text());
  const name = body.name?.trim();
  const email = body.email?.trim();
  const budget = body.budget?.trim();
  const message = body.message?.trim();

  if (!name || !email || !budget || !message) {
    return jsonResponse({ error: "Missing required fields" }, 400);
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (turnstileSecret) {
    if (!body.turnstileToken) {
      return jsonResponse({ error: "Verification required" }, 400);
    }
    const verified = await verifyTurnstile(turnstileSecret, body.turnstileToken);
    if (!verified) {
      return jsonResponse({ error: "Verification failed" }, 400);
    }
  }

  try {
    await sendContactEmail({
      name,
      email,
      subject: body.subject?.trim() || null,
      phone: body.phone?.trim() || null,
      budget,
      message,
    });
    return jsonResponse({ ok: true });
  } catch (e) {
    const errMessage =
      e instanceof Error && e.message.includes("RESEND_API_KEY")
        ? "Email delivery is not configured"
        : e instanceof Error
          ? e.message
          : "Send failed";
    return jsonResponse({ error: errMessage }, 500);
  }
}
