import { sendContactEmail } from "./contactEmail";
import { checkContactRateLimit } from "./rateLimit";
import { verifyTurnstile } from "./turnstile";
import type {
  ContactHandlerResult,
  ContactRequestBody,
  ContactRequestMeta,
} from "./types";
import { ResendApiError } from "./types";
import {
  createSubmissionIdempotencyKey,
  parseContactBody,
} from "./validation";

function mapResendError(error: ResendApiError): ContactHandlerResult {
  if (error.status === 429) {
    return {
      ok: false,
      status: 429,
      error:
        "Email service is busy due to high demand. Please wait a moment and try again.",
      retryAfter: error.retryAfter ?? 60,
    };
  }

  if (error.status === 401 || error.status === 403) {
    return {
      ok: false,
      status: 500,
      error: "Email delivery is not configured correctly",
    };
  }

  if (error.status >= 500) {
    return {
      ok: false,
      status: 503,
      error: "Email service is temporarily unavailable. Please try again soon.",
      retryAfter: error.retryAfter ?? 30,
    };
  }

  return {
    ok: false,
    status: 400,
    error: error.message,
  };
}

export async function handleContactSubmission(
  body: ContactRequestBody,
  meta: ContactRequestMeta,
): Promise<ContactHandlerResult> {
  const rate = checkContactRateLimit(meta.clientIp);
  if (!rate.ok) {
    return {
      ok: false,
      status: 429,
      error: "Too many contact requests. Please try again later.",
      retryAfter: rate.retryAfter ?? 60,
    };
  }

  const parsed = parseContactBody(body);
  if (!parsed.ok) {
    return { ok: false, status: 400, error: parsed.error };
  }

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (turnstileSecret) {
    const token = body.turnstileToken?.trim();
    if (!token) {
      return { ok: false, status: 400, error: "Verification required" };
    }
    const verified = await verifyTurnstile(
      turnstileSecret,
      token,
      meta.clientIp,
    );
    if (!verified) {
      return { ok: false, status: 400, error: "Verification failed" };
    }
  }

  try {
    const idempotencyKey =
      meta.idempotencyKey ||
      (await createSubmissionIdempotencyKey(parsed.submission));

    await sendContactEmail(parsed.submission, idempotencyKey);
    return { ok: true };
  } catch (error) {
    if (error instanceof ResendApiError) {
      return mapResendError(error);
    }

    if (error instanceof Error && error.message.includes("RESEND_API_KEY")) {
      return {
        ok: false,
        status: 500,
        error: "Email delivery is not configured",
      };
    }

    return { ok: false, status: 500, error: "Send failed" };
  }
}
