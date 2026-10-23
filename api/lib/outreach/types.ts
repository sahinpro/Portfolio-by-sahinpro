export type OutreachZoneTarget = {
  marketId: string;
  marketName: string;
  flag: string;
  zoneId: string;
  city: string;
  tz: string;
};

export const OUTREACH_WINDOW_DAYS = [2, 3, 4] as const;
export const OUTREACH_WINDOW_START_MINUTES = 9 * 60 + 30;
export const OUTREACH_WINDOW_END_MINUTES = 11 * 60;
export const OUTREACH_WINDOW_OPEN_LABEL = "09:30";
export const OUTREACH_BD_TZ = "Asia/Dhaka";

/** How many minutes after 09:30 local the cron may still fire (avoids backlog on deploy). */
export const OUTREACH_CRON_GRACE_MINUTES = 4;

export const SITE_SETTING_PLANNER_ZONES_KEY = "outreach_planner_zones";
