/**
 * Regression tests for the shared admin allowlist gate.
 *
 * `isAllowedAdminEmail` must fail CLOSED: authorize only the exact configured
 * email and deny on a null user, a missing email, or a missing/blank
 * NEXT_PUBLIC_ADMIN_EMAIL. Comparison is trimmed + case-insensitive.
 *
 * `env.adminEmail` is a live getter over `process.env`, so setting the var per
 * test takes effect immediately. The original value is always restored.
 */
import type { User } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import { isAllowedAdminEmail } from "../auth";

function userWithEmail(email: string | null | undefined): User {
  return { email } as unknown as User;
}

describe("isAllowedAdminEmail (fail-closed admin gate)", () => {
  const ENV_KEY = "NEXT_PUBLIC_ADMIN_EMAIL";
  let original: string | undefined;

  beforeEach(() => {
    original = process.env[ENV_KEY];
  });

  afterEach(() => {
    if (original === undefined) delete process.env[ENV_KEY];
    else process.env[ENV_KEY] = original;
  });

  it("denies a null user", () => {
    process.env[ENV_KEY] = "admin@example.com";
    assert.equal(isAllowedAdminEmail(null), false);
  });

  it("denies a user with no email", () => {
    process.env[ENV_KEY] = "admin@example.com";
    assert.equal(isAllowedAdminEmail(userWithEmail(undefined)), false);
    assert.equal(isAllowedAdminEmail(userWithEmail("")), false);
  });

  it("denies when NEXT_PUBLIC_ADMIN_EMAIL is missing (fail-closed)", () => {
    delete process.env[ENV_KEY];
    assert.equal(
      isAllowedAdminEmail(userWithEmail("admin@example.com")),
      false,
    );
  });

  it("denies when NEXT_PUBLIC_ADMIN_EMAIL is empty", () => {
    process.env[ENV_KEY] = "";
    assert.equal(
      isAllowedAdminEmail(userWithEmail("admin@example.com")),
      false,
    );
  });

  it("denies when NEXT_PUBLIC_ADMIN_EMAIL is whitespace only", () => {
    process.env[ENV_KEY] = "   ";
    assert.equal(
      isAllowedAdminEmail(userWithEmail("admin@example.com")),
      false,
    );
  });

  it("denies a non-matching email", () => {
    process.env[ENV_KEY] = "admin@example.com";
    assert.equal(
      isAllowedAdminEmail(userWithEmail("other@example.com")),
      false,
    );
  });

  it("allows a matching email regardless of letter casing", () => {
    process.env[ENV_KEY] = "Admin@Example.com";
    assert.equal(isAllowedAdminEmail(userWithEmail("admin@example.com")), true);
  });

  it("allows a matching email with surrounding whitespace on either side", () => {
    process.env[ENV_KEY] = "  admin@example.com  ";
    assert.equal(
      isAllowedAdminEmail(userWithEmail("  Admin@Example.COM ")),
      true,
    );
  });
});
