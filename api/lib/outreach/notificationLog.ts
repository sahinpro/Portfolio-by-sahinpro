import { getSupabaseServiceClient } from "../supabaseService";
import { OUTREACH_WINDOW_OPEN_LABEL } from "./types";

export type NotificationDeliveryStatus = "sent" | "failed";

export type NotificationLogRow = {
  iana_timezone: string;
  local_date: string;
  window_start: string;
  market_id: string;
  zone_city: string;
  status: NotificationDeliveryStatus;
  resend_id: string | null;
  error_message: string | null;
  sent_at: string | null;
};

const TABLE = "outreach_window_notifications";

export async function wasNotificationAlreadySent(
  ianaTimezone: string,
  localDate: string,
): Promise<boolean> {
  const client = getSupabaseServiceClient();
  if (!client) return false;

  const { data, error } = await client
    .from(TABLE)
    .select("status")
    .eq("iana_timezone", ianaTimezone)
    .eq("local_date", localDate)
    .eq("window_start", OUTREACH_WINDOW_OPEN_LABEL)
    .maybeSingle();

  if (error) {
    console.error("[outreach-notify] dedupe lookup failed", {
      code: error.code,
      message: error.message,
    });
    return false;
  }

  return data?.status === "sent";
}

export async function recordNotificationDelivery(
  row: Omit<NotificationLogRow, "sent_at"> & { sent_at?: string | null },
): Promise<void> {
  const client = getSupabaseServiceClient();
  if (!client) return;

  const payload = {
    ...row,
    window_start: OUTREACH_WINDOW_OPEN_LABEL,
    sent_at: row.status === "sent" ? row.sent_at ?? new Date().toISOString() : null,
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
