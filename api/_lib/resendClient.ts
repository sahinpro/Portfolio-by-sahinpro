import { ResendApiError, type ResendSendResult } from "./types";

const RESEND_API_URL = "https://api.resend.com/emails";
const MAX_ATTEMPTS = 3;

type ResendErrorBody = {
  message?: string;
  name?: string;
};

type SendResendEmailInput = {
  apiKey: string;
  from: string;
  to: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey: string;
  templateId?: string;
  templateVariables?: Record<string, string>;
  tag?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterSeconds(response: Response): number | undefined {
  const header = response.headers.get("retry-after");
  if (!header) return undefined;
  const seconds = Number.parseInt(header, 10);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : undefined;
}

function shouldRetry(status: number): boolean {
  return status === 429 || status >= 500;
}

async function readResendError(response: Response): Promise<ResendApiError> {
  let message = response.statusText || "Resend request failed";
  try {
    const payload = (await response.json()) as ResendErrorBody;
    if (payload.message) message = payload.message;
  } catch {
    /* ignore */
  }

  return new ResendApiError(
    message,
    response.status,
    parseRetryAfterSeconds(response),
  );
}

function buildPayload(input: SendResendEmailInput): Record<string, unknown> {
  const tag = input.tag ?? "portfolio-contact";
  const base: Record<string, unknown> = {
    from: input.from,
    to: [input.to],
    subject: input.subject,
    tags: [{ name: "source", value: tag }],
  };
  if (input.replyTo) base.reply_to = input.replyTo;

  if (input.templateId) {
    return {
      ...base,
      template: {
        id: input.templateId,
        variables: input.templateVariables ?? {},
      },
    };
  }

  return {
    ...base,
    html: input.html,
    text: input.text,
  };
}

/**
 * Sends via Resend REST API per official docs:
 * - Idempotency-Key header (24h dedupe window)
 * - Retries 429/5xx honoring retry-after
 * - No retries on 400/401/403/409
 */
export async function sendViaResend(
  input: SendResendEmailInput,
): Promise<ResendSendResult> {
  const payload = buildPayload(input);
  let lastError: ResendApiError | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": input.idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = (await response.json()) as { id?: string };
      return { id: data.id ?? "unknown" };
    }

    const error = await readResendError(response);
    lastError = error;

    if (!shouldRetry(error.status) || attempt === MAX_ATTEMPTS - 1) {
      throw error;
    }

    const delaySeconds = error.retryAfter ?? 2 ** attempt;
    await sleep(delaySeconds * 1000);
  }

  throw lastError ?? new ResendApiError("Resend request failed", 500);
}
