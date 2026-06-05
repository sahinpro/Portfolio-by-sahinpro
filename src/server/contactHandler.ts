import { sendContactEmail } from "@/server/contactEmail";

export type ContactRequestBody = Record<string, string | undefined>;

export type ContactHandlerResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

async function verifyTurnstile(
  secret: string,
  token: string,
): Promise<boolean> {
  const verify = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret,
        response: token,
      }),
    },
  );
  const outcome = (await verify.json()) as { success?: boolean };
  return Boolean(outcome.success);
}

export async function handleContactSubmission(
  body: ContactRequestBody,
): Promise<ContactHandlerResult> {
  const {
    name,
    email,
    subject,
    phone,
    budget,
    message,
    turnstileToken,
  } = body;

  if (!name?.trim() || !email?.trim() || !budget?.trim() || !message?.trim()) {
    return { ok: false, status: 400, error: "Missing required fields" };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (turnstileSecret) {
    if (!turnstileToken) {
      return { ok: false, status: 400, error: "Verification required" };
    }
    const verified = await verifyTurnstile(turnstileSecret, turnstileToken);
    if (!verified) {
      return { ok: false, status: 400, error: "Verification failed" };
    }
  }

  try {
    await sendContactEmail({
      name: name.trim(),
      email: email.trim(),
      subject: subject?.trim() || null,
      phone: phone?.trim() || null,
      budget: budget.trim(),
      message: message.trim(),
    });
    return { ok: true };
  } catch (e) {
    const message =
      e instanceof Error && e.message.includes("RESEND_API_KEY")
        ? "Email delivery is not configured"
        : "Send failed";
    return { ok: false, status: 500, error: message };
  }
}
