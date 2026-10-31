/**
 * POST /api/contact — validation & error-response contract (website-owned).
 *
 * Ported coverage for the behaviors the old `src/app/api/contact/route.ts`
 * guaranteed: 400 validation errors, 400 turnstile failures, 413 body cap,
 * 429 rate limiting (+Retry-After), 500 when email is unconfigured, and the
 * 200 `{ ok: true }` happy path with the Resend idempotency header. Every
 * outbound call (Resend, Turnstile) goes through the fetch stub — no real
 * service is touched, and each test uses its own client IP so the in-memory
 * limiter cannot bleed across tests.
 */
import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { api } from "../app";
import {
  installFetchStub,
  isResend,
  isTurnstile,
  nextTestIp,
  withEnv,
} from "./harness";

const CLEAN_CONTACT_ENV = {
  RESEND_API_KEY: undefined,
  TURNSTILE_SECRET_KEY: undefined,
  CONTACT_RATE_LIMIT_PER_MINUTE: undefined,
  CONTACT_RATE_LIMIT_WINDOW_MS: undefined,
};

const VALID_BODY = JSON.stringify({
  name: "Test Person",
  email: "test@example.com",
  message: "Hello there, this is a test enquiry.",
});

function postContact(
  body: string,
  ip: string,
  extraHeaders: Record<string, string> = {},
) {
  return api.request("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
      ...extraHeaders,
    },
    body,
  });
}

let stub: ReturnType<typeof installFetchStub> | null = null;
afterEach(() => {
  stub?.restore();
  stub = null;
});

describe("website api: contact", () => {
  it("rejects missing required fields with 400 + CORS headers", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_CONTACT_ENV, async () => {
      const res = await postContact("{}", nextTestIp());
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: "Missing required fields" });
      assert.equal(res.headers.get("access-control-allow-origin"), "*");
      assert.equal(stub!.length, 0); // rejected before any outbound call
    });
  });

  it("rejects an invalid email with 400", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_CONTACT_ENV, async () => {
      const res = await postContact(
        JSON.stringify({ name: "A", email: "not-an-email", message: "Hi" }),
        nextTestIp(),
      );
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: "Invalid email address" });
    });
  });

  it("treats a malformed JSON body as missing fields (400, not 500)", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_CONTACT_ENV, async () => {
      const res = await postContact("this is not json", nextTestIp());
      assert.equal(res.status, 400);
      assert.deepEqual(await res.json(), { error: "Missing required fields" });
    });
  });

  it("rejects oversized bodies with 413", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_CONTACT_ENV, async () => {
      const huge = JSON.stringify({
        name: "A",
        email: "a@b.co",
        message: "x".repeat(33_000),
      });
      const res = await postContact(huge, nextTestIp());
      assert.equal(res.status, 413);
      assert.deepEqual(await res.json(), { error: "Request body too large" });
    });
  });

  it("requires a turnstile token once TURNSTILE_SECRET_KEY is configured", async () => {
    stub = installFetchStub([]);
    await withEnv(
      { ...CLEAN_CONTACT_ENV, TURNSTILE_SECRET_KEY: "test-secret" },
      async () => {
        const res = await postContact(VALID_BODY, nextTestIp());
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: "Verification required" });
      },
    );
  });

  it("answers 400 when turnstile verification fails upstream", async () => {
    stub = installFetchStub([{ match: isTurnstile, json: { success: false } }]);
    await withEnv(
      { ...CLEAN_CONTACT_ENV, TURNSTILE_SECRET_KEY: "test-secret" },
      async () => {
        const res = await postContact(
          JSON.stringify({
            ...JSON.parse(VALID_BODY),
            turnstileToken: "bad-token",
          }),
          nextTestIp(),
        );
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: "Verification failed" });
      },
    );
  });

  it("answers 500 when email delivery is not configured", async () => {
    stub = installFetchStub([]);
    await withEnv(CLEAN_CONTACT_ENV, async () => {
      const res = await postContact(VALID_BODY, nextTestIp());
      assert.equal(res.status, 500);
      assert.deepEqual(await res.json(), {
        error: "Email delivery is not configured",
      });
      assert.equal(stub!.length, 0);
    });
  });

  it("rate-limits repeated submissions per IP with 429 + Retry-After", async () => {
    stub = installFetchStub([{ match: isResend, json: { id: "email-1" } }]);
    await withEnv(
      {
        ...CLEAN_CONTACT_ENV,
        RESEND_API_KEY: "test-key",
        CONTACT_RATE_LIMIT_PER_MINUTE: "2",
      },
      async () => {
        const ip = nextTestIp();
        assert.equal((await postContact(VALID_BODY, ip)).status, 200);
        assert.equal((await postContact(VALID_BODY, ip)).status, 200);
        const limited = await postContact(VALID_BODY, ip);
        assert.equal(limited.status, 429);
        assert.deepEqual(await limited.json(), {
          error: "Too many contact requests. Please try again later.",
        });
        assert.ok(Number(limited.headers.get("retry-after")) >= 1);
      },
    );
  });

  it("sends a well-formed submission and forwards the idempotency key to Resend", async () => {
    stub = installFetchStub([{ match: isResend, json: { id: "email-42" } }]);
    await withEnv(
      { ...CLEAN_CONTACT_ENV, RESEND_API_KEY: "test-key" },
      async () => {
        const res = await postContact(VALID_BODY, nextTestIp(), {
          "x-idempotency-key": "idem-abc",
        });
        assert.equal(res.status, 200);
        assert.deepEqual(await res.json(), { ok: true });

        const email = stub!.find((call) => isResend(call.url));
        assert.ok(email, "expected a Resend send");
        assert.equal(email!.method, "POST");
        assert.equal(email!.headers["idempotency-key"], "idem-abc");
        assert.equal(email!.headers.authorization, "Bearer test-key");
        const payload = JSON.parse(email!.body!) as Record<string, unknown>;
        assert.deepEqual(payload.to, ["contact@sahinpro.me"]);
        assert.equal(payload.reply_to, "test@example.com");
      },
    );
  });

  it("maps a Resend 4xx rejection to 400 with the upstream message", async () => {
    stub = installFetchStub([
      {
        match: isResend,
        status: 422,
        json: { message: "domain not verified", name: "invalid_parameter" },
      },
    ]);
    await withEnv(
      { ...CLEAN_CONTACT_ENV, RESEND_API_KEY: "test-key" },
      async () => {
        const res = await postContact(VALID_BODY, nextTestIp());
        assert.equal(res.status, 400);
        assert.deepEqual(await res.json(), { error: "domain not verified" });
      },
    );
  });
});
