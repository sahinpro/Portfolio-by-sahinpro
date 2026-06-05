import type { ContactRequestBody, ContactSubmission } from "./types";

/** Resend template string variables max 2,000 characters. */
const LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  phone: 40,
  budget: 80,
  message: 4000,
} as const;

const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function clip(value: string, max: number): string {
  return value.length <= max ? value : value.slice(0, max);
}

export function parseContactBody(
  body: ContactRequestBody,
):
  | { ok: true; submission: ContactSubmission }
  | { ok: false; error: string } {
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const budget = body.budget?.trim();
  const message = body.message?.trim();

  if (!name || !email || !budget || !message) {
    return { ok: false, error: "Missing required fields" };
  }

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "Invalid email address" };
  }

  return {
    ok: true,
    submission: {
      name: clip(name, LIMITS.name),
      email: clip(email, LIMITS.email),
      subject: body.subject?.trim()
        ? clip(body.subject.trim(), LIMITS.subject)
        : null,
      phone: body.phone?.trim()
        ? clip(body.phone.trim(), LIMITS.phone)
        : null,
      budget: clip(budget, LIMITS.budget),
      message: clip(message, LIMITS.message),
    },
  };
}

export async function createSubmissionIdempotencyKey(
  submission: ContactSubmission,
): Promise<string> {
  const bucket = Math.floor(Date.now() / (10 * 60 * 1000));
  const raw = [
    submission.email,
    submission.name,
    submission.message,
    submission.budget,
    String(bucket),
  ].join("|");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 64);
}
