export type ContactRequestBody = Record<string, string | undefined>;

export type ContactSubmission = {
  name: string;
  email: string;
  subject: string | null;
  phone: string | null;
  budget: string;
  message: string;
};

export type ContactHandlerResult =
  | { ok: true }
  | { ok: false; status: number; error: string; retryAfter?: number };

export type ContactRequestMeta = {
  clientIp: string;
  idempotencyKey: string;
};

export type ResendSendResult = {
  id: string;
};

export class ResendApiError extends Error {
  readonly status: number;
  readonly retryAfter?: number;

  constructor(message: string, status: number, retryAfter?: number) {
    super(message);
    this.name = "ResendApiError";
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
