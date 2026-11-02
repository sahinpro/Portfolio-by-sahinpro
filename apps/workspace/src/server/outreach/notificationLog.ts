import { getSupabaseServiceClient } from "../lib/supabaseService";
import { OUTREACH_WINDOW_OPEN_LABEL } from "./types";

export type NotificationDeliveryStatus = "sent" | "failed";

export type NotificationLogRow = {
  iana_timezone: string;
  local_date: string;
  /** HH:MM label of the configured reminder time; recorded for history. */
  window_start: string;
  market_id: string;
  zone_city: string;
  status: NotificationDeliveryStatus;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
};

const TABLE = "outreach_window_notifications";

// NOTE: the send/no-send decision is NOT read from this table any more — it
// lives in reminderClaim.ts (atomic `outreach_window_claims` insert), which
// is immune to legacy duplicate rows and fails safe on query errors.
// This module is append-only delivery history.

export async function recordNotificationDelivery(
  row: Omit<NotificationLogRow, "sent_at" | "window_start"> & {
    sent_at?: string | null;
    window_start?: string;
  },
): Promise<void> {
  const client = getSupabaseServiceClient();
  if (!client) return;

  const payload = {
    ...row,
    window_start: row.window_start ?? OUTREACH_WINDOW_OPEN_LABEL,
    sent_at:
      row.status === "sent" ? (row.sent_at ?? new Date().toISOString()) : null,
  };

  const { error } = await client.from(TABLE).upsert(payload, {
    onConflict: "iana_timezone,local_date,window_start",
  });

  if (error) {
    console.error("[outreach-notify] log upsert failed", {
      code: error.code,
      message: error.message,
    });
  }
}
