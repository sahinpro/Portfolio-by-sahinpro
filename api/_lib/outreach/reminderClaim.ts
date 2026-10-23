import { getSupabaseServiceClient } from "../supabaseService";

/**
 * Atomic "one reminder per IANA zone per local date" claim, enforced by the
 * `outreach_window_claims` primary key (iana_timezone, local_date).
 *
 * This replaces the old read-then-send dedupe lookup, which:
 *   - was keyed on `window_start`, so a mid-window schedule edit could
 *     double-send for the same zone and local date;
 *   - failed OPEN when the query errored or when legacy duplicate rows
 *     broke the single-row read (error was treated as "not sent yet");
 *   - raced: two concurrent cron ticks could both read "not sent" and both
 *     send before either wrote the log row.
 *
 * Semantics now:
 *   - claim inserted   → this tick owns the send for the zone/date;
 *   - claim ignored    → already sent (or another tick owns it) → skip;
 *   - claim errored    → fail SAFE, do not send; next tick retries;
 *   - send failed      → release the claim so the next tick can retry.
 *
 * The `outreach_window_notifications` log is untouched: it stays an
 * append-only delivery history and is never consulted for the send decision.
 */

export const OUTREACH_CLAIMS_TABLE = "outreach_window_claims";

/** Minimal structural view of the Supabase client used here (testable seam). */
export type ReminderClaimClient = {
  from: (table: string) => {
    insert: (
      rows: Record<string, unknown>[],
      options?: { ignoreDuplicates?: boolean },
    ) => {
      select: (columns: string) => Promise<{
        data: Record<string, unknown>[] | null;
        error: { code?: string; message: string } | null;
      }>;
    };
    delete: () => {
      eq: (
        column: string,
        value: string,
      ) => {
        eq: (
          column: string,
          value: string,
        ) => Promise<{
          error: { code?: string; message: string } | null;
        }>;
      };
    };
  };
};

export type ReminderClaimOutcome =
  | { status: "claimed" }
  | { status: "duplicate" }
  | { status: "error"; reason: string };

export async function claimReminderSlot(
  client: ReminderClaimClient,
  input: { ianaTimezone: string; localDate: string; windowStart: string },
): Promise<ReminderClaimOutcome> {
  const { data, error } = await client
    .from(OUTREACH_CLAIMS_TABLE)
    .insert(
      [
        {
          iana_timezone: input.ianaTimezone,
          local_date: input.localDate,
          window_start: input.windowStart,
        },
      ],
      { ignoreDuplicates: true },
    )
    .select("iana_timezone");

  if (error) {
    // Fail safe: a broken/unreachable claims table (e.g. migration not yet
    // applied) must never be interpreted as "no previous notification".
    console.error("[outreach-notify] claim insert failed", {
      code: error.code,
      message: error.message,
    });
    return {
      status: "error",
      reason: `${error.code ?? "unknown"}: ${error.message}`,
    };
  }

  // With ignoreDuplicates, the returning select contains only rows that were
  // actually inserted; a deduplicated (already claimed) insert returns [].
  return data && data.length > 0
    ? { status: "claimed" }
    : { status: "duplicate" };
}

/**
 * Release a claim after a failed send so the next tick can retry.
 * Returns an error reason when the release itself fails; the runner surfaces
 * that as a warning (a stuck claim suppresses a later retry rather than
 * risking a double send — the fail-safe direction).
 */
export async function releaseReminderSlot(
  client: ReminderClaimClient,
  ianaTimezone: string,
  localDate: string,
): Promise<string | null> {
  const { error } = await client
    .from(OUTREACH_CLAIMS_TABLE)
    .delete()
    .eq("iana_timezone", ianaTimezone)
    .eq("local_date", localDate);

  if (error) {
    console.error("[outreach-notify] claim release failed", {
      code: error.code,
      message: error.message,
    });
    return `${error.code ?? "unknown"}: ${error.message}`;
  }
  return null;
}

/** Service-role client narrowed to the claim operations, or null. */
export function getReminderClaimClient(): ReminderClaimClient | null {
  const client = getSupabaseServiceClient();
  if (!client) return null;
  return client as unknown as ReminderClaimClient;
}
