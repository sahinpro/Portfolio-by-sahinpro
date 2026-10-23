import { OUTREACH_MARKETS, type OutreachMarket } from "./marketsData";
import type { OutreachZoneTarget } from "./types";

function isValidZone(market: OutreachMarket, tz: string): boolean {
  return market.zones.some((z) => z.tz === tz);
}

/**
 * Parse optional env override:
 * OUTREACH_NOTIFICATION_ZONES='[{"marketId":"us","tz":"America/New_York"}]'
 */
export function parseEnvZoneOverrides(raw: string | undefined): OutreachZoneTarget[] {
  const trimmed = raw?.trim();
  if (!trimmed) return [];
  try {
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: OutreachZoneTarget[] = [];
    for (const entry of parsed) {
      if (!entry || typeof entry !== "object") continue;
      const marketId = String((entry as { marketId?: string }).marketId ?? "");
      const tz = String((entry as { tz?: string }).tz ?? "");
      const market = OUTREACH_MARKETS.find((m) => m.id === marketId);
      if (!market || !isValidZone(market, tz)) continue;
      const zone = market.zones.find((z) => z.tz === tz)!;
      out.push({
        marketId: market.id,
        marketName: market.name,
        flag: market.flag,
        zoneId: zone.id,
        city: zone.city,
        tz: zone.tz,
      });
    }
    return out;
  } catch {
    return [];
  }
}

export function sanitizePlannerZones(
  record: unknown,
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!record || typeof record !== "object") return out;
  for (const market of OUTREACH_MARKETS) {
    const value = (record as Record<string, unknown>)[market.id];
    if (typeof value === "string" && isValidZone(market, value)) {
      out[market.id] = value;
    }
  }
  return out;
}

/**
 * Resolve which zones receive scheduled reminders.
 * Priority: env OUTREACH_NOTIFICATION_ZONES → planner picks (Supabase) → all zones per market.
 */
export function resolveNotificationZones(
  plannerZones: Record<string, string>,
  envOverrides?: string,
): OutreachZoneTarget[] {
  const fromEnv = parseEnvZoneOverrides(envOverrides);
  if (fromEnv.length > 0) return fromEnv;

  const picks = sanitizePlannerZones(plannerZones);
  const targets: OutreachZoneTarget[] = [];

  for (const market of OUTREACH_MARKETS) {
    const pickedTz = picks[market.id];
    if (pickedTz) {
      const zone = market.zones.find((z) => z.tz === pickedTz)!;
      targets.push({
        marketId: market.id,
        marketName: market.name,
        flag: market.flag,
        zoneId: zone.id,
        city: zone.city,
        tz: zone.tz,
      });
      continue;
    }

    for (const zone of market.zones) {
      targets.push({
        marketId: market.id,
        marketName: market.name,
        flag: market.flag,
        zoneId: zone.id,
        city: zone.city,
        tz: zone.tz,
      });
    }
  }

  return targets;
}
