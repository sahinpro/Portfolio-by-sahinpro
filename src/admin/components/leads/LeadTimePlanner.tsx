"use client";

import { ZonePicker } from "@/admin/components/leads/LeadZonePicker";
import {
  OUTREACH_MARKETS,
  findZoneByCity,
  type MarketZone,
  type OutreachMarket,
} from "@/admin/constants/outreachMarkets";
import {
  getPlannerPreferences,
  savePlannerPreferences,
} from "@/admin/lib/leads/leadDb";
import { syncPlannerZonesToCloud } from "@/admin/lib/leads/plannerCloudSync";
import {
  minutesOfDayInTz,
  projectWallClock,
  tzParts,
} from "@/admin/lib/leads/timezone";
import type { Lead } from "@/admin/types/lead";
import {
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  MapPin,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

/** Recommended window: Tue–Thu, 09:30–11:00 in the prospect's local time. */
const WINDOW_DAYS = [2, 3, 4]; // Tue, Wed, Thu (Sun = 0)
const WINDOW_START = 9 * 60 + 30;
const WINDOW_END = 11 * 60;
const BD_TZ = "Asia/Dhaka";
const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type ZoneSource = "picked" | "leads" | "assumed" | "fixed";

type MarketView = {
  market: OutreachMarket;
  zone: MarketZone;
  source: ZoneSource;
  leadCount: number;
  weekday: string;
  localNow: string;
  status: "active" | "soon" | "passed" | "offday";
  detail: string;
  bdWindow: string;
};

const VALID_MARKET_IDS = new Set(OUTREACH_MARKETS.map((m) => m.id));

/** Keep only zones that still exist for their market, so a stale DB record can never break the planner. */
function sanitizeZones(record: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!record || typeof record !== "object") return out;
  for (const market of OUTREACH_MARKETS) {
    const value = (record as Record<string, unknown>)[market.id];
    if (typeof value === "string" && market.zones.some((zz) => zz.tz === value)) {
      out[market.id] = value;
    }
  }
  return out;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function countryMatches(lead: Lead, market: OutreachMarket): boolean {
  const c = (lead.country || "").toLowerCase().trim();
  if (!c) return false;
  return market.countries.some(
    (name) => c === name || c.includes(name) || name.includes(c),
  );
}

/** Pick the zone: user override → the city most common among that market's leads → default. */
function resolveZone(
  market: OutreachMarket,
  leads: Lead[],
  override: string | undefined,
): { zone: MarketZone; source: ZoneSource } {
  if (override) {
    const zone = market.zones.find((zz) => zz.tz === override);
    if (zone) return { zone, source: "picked" };
  }
  const tally = new Map<string, number>();
  for (const lead of leads) {
    const zone = findZoneByCity(market, lead.city);
    if (zone) tally.set(zone.tz, (tally.get(zone.tz) ?? 0) + 1);
  }
  let best: { tz: string; n: number } | null = null;
  for (const [tz, n] of tally) {
    if (!best || n > best.n) best = { tz, n };
  }
  if (best) {
    const zone = market.zones.find((zz) => zz.tz === best.tz);
    if (zone) return { zone, source: "leads" };
  }
  // Single-zone markets (UK, DE, IT) are never ambiguous.
  if (market.zones.length === 1) return { zone: market.zones[0], source: "fixed" };
  return { zone: market.zones[0], source: "assumed" };
}

function buildView(
  market: OutreachMarket,
  leads: Lead[],
  override: string | undefined,
  now: Date,
): MarketView {
  const { zone, source } = resolveZone(market, leads, override);
  const parts = tzParts(zone.tz, now);
  const idx = WEEKDAY_INDEX[parts.weekday] ?? 0;
  const mins = minutesOfDayInTz(zone.tz, now);
  const inWindowDay = WINDOW_DAYS.includes(idx);

  let status: MarketView["status"] = "offday";
  let detail = "";
  if (!inWindowDay) {
    const days = (2 - idx + 7) % 7;
    status = "offday";
    detail = days === 1 ? "Next window tomorrow" : `Next window Tue in ${days}d`;
  } else if (mins > WINDOW_END) {
    status = "passed";
    detail = "Window closed for today";
  } else if (mins >= WINDOW_START) {
    const left = WINDOW_END - mins;
    status = "active";
    detail = `${pad(Math.floor(left / 60))}h ${pad(left % 60)}m left`;
  } else {
    const left = WINDOW_START - mins;
    status = "soon";
    detail = `Opens in ${pad(Math.floor(left / 60))}h ${pad(left % 60)}m`;
  }

  const start = projectWallClock(zone.tz, BD_TZ, 9, 30, now);
  const end = projectWallClock(zone.tz, BD_TZ, 11, 0, now);
  const dayMark = (d: number) =>
    d === 0 ? "" : d > 0 ? `+${d}d` : `\u2212${-d}d`;
  const startStr = `${pad(start.hour)}:${pad(start.minute)}`;
  const endStr = `${pad(end.hour)}:${pad(end.minute)}`;
  // Mark the day change once when both ends share it, otherwise on each end.
  const bdWindow =
    start.dayShift === end.dayShift
      ? `${startStr}\u2013${endStr} BD ${dayMark(start.dayShift)}`.trim()
      : `${startStr}${dayMark(start.dayShift)}\u2013${endStr}${dayMark(end.dayShift)} BD`;

  return {
    market,
    zone,
    source,
    leadCount: leads.filter((l) => countryMatches(l, market)).length,
    weekday: parts.weekday,
    localNow: `${pad(parts.hour)}:${pad(parts.minute)}`,
    status,
    detail,
    bdWindow,
  };
}

const STATUS_STYLE: Record<MarketView["status"], string> = {
  active: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  soon: "bg-amber-500/15 text-amber-200 border-amber-500/25",
  passed: "bg-zinc-500/20 text-zinc-300 border-zinc-500/30",
  offday: "bg-white/[0.06] text-white/40 border-white/[0.08]",
};

const STATUS_LABEL: Record<MarketView["status"], string> = {
  active: "Window open now",
  soon: "Approaching",
  passed: "Passed today",
  offday: "Outside window",
};

function MarketCard({
  view,
  onPickZone,
}: {
  view: MarketView;
  onPickZone: (tz: string | null) => void;
}): JSX.Element {
  const { market, zone, source } = view;
  const [editing, setEditing] = useState(false);
  const zoneSuffix =
    source === "leads" && view.leadCount > 0 ? " · from your leads" : "";
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-white/85">
            <span aria-hidden>{market.flag}</span>
            <span className="truncate">{market.name}</span>
          </p>
          <p className="mt-0.5 truncate text-[11px] text-white/35">
            {zone.city}
            {zoneSuffix}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-md border px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap ${STATUS_STYLE[view.status]}`}
        >
          {STATUS_LABEL[view.status]}
        </span>
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/30">
            Local now · {view.weekday}
          </p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">
            {view.localNow}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-white/30">
            Window · BD time
          </p>
          <p className="mt-0.5 text-xs tabular-nums text-white/70">
            09:30–11:00
          </p>
          <p className="text-[11px] tabular-nums text-white/45">{view.bdWindow}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p
          className={`text-[11px] ${
            view.status === "active"
              ? "text-emerald-300"
              : view.status === "soon"
                ? "text-amber-200"
                : "text-white/40"
          }`}
        >
          {view.detail}
        </p>
        <p className="flex items-center gap-1 text-[11px] text-white/35">
          <MapPin className="h-3 w-3" />
          {view.leadCount} lead{view.leadCount === 1 ? "" : "s"}
        </p>
      </div>

      {source === "assumed" ? (
        <div className="mt-2.5 rounded-lg border border-amber-500/20 bg-amber-500/[0.07] p-2">
          <p className="text-[11px] text-amber-200/90">
            Multiple time zones here and no lead city to match — pick one so the
            times are correct:
          </p>
          <div className="mt-1.5">
            <ZonePicker
              value=""
              options={market.zones}
              onChange={(tz) => onPickZone(tz)}
              ariaLabel={`Select city or time zone for ${market.name}`}
              placeholder="Select a city / zone…"
            />
          </div>
        </div>
      ) : market.zones.length > 1 ? (
        <div className="mt-2 flex items-center justify-end gap-2">
          {editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="shrink-0 text-[11px] text-white/35 hover:text-white/60"
              >
                Cancel
              </button>
              <div className="w-[190px] max-w-full">
                <ZonePicker
                  value={zone.tz}
                  options={market.zones}
                  onChange={(tz) => {
                    onPickZone(tz);
                    setEditing(false);
                  }}
                  ariaLabel={`Change time zone for ${market.name}`}
                />
              </div>
            </>
          ) : (
            <>
              {source === "picked" ? (
                <button
                  type="button"
                  onClick={() => onPickZone(null)}
                  className="text-[11px] text-white/35 hover:text-white/60"
                >
                  Auto
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-[11px] text-white/35 hover:text-white/60"
              >
                Change zone
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

/**
 * Compact multi-country outreach time planner shown at the top of the Leads
 * page. Purely local: reads the leads already loaded from IndexedDB and uses
 * the browser's Intl time-zone database (DST-aware). No network, no writes.
 */
export function LeadTimePlanner({
  leads,
  ready,
}: {
  leads: Lead[];
  ready: boolean;
}): JSX.Element | null {
  const [expanded, setExpanded] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [now, setNow] = useState<Date | null>(null);
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const lastSavedRef = useRef<string>("");

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  // Restore saved choices from the local IndexedDB `lead_prefs` store.
  useEffect(() => {
    let cancelled = false;
    void getPlannerPreferences()
      .then((prefs) => {
        if (cancelled) return;
        const zones = sanitizeZones(prefs.outreachZones);
        const nextFilter =
          typeof prefs.marketFilter === "string" &&
          (prefs.marketFilter === "all" ||
            VALID_MARKET_IDS.has(prefs.marketFilter))
            ? prefs.marketFilter
            : "all";
        const nextExpanded = prefs.expanded !== false;
        setOverrides(zones);
        setFilter(nextFilter);
        setExpanded(nextExpanded);
        lastSavedRef.current = JSON.stringify({
          outreachZones: zones,
          marketFilter: nextFilter,
          expanded: nextExpanded,
        });
        setPrefsLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setPrefsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist every change back to IndexedDB (debounced, local-only).
  useEffect(() => {
    if (!prefsLoaded) return;
    const snapshot = JSON.stringify({
      outreachZones: overrides,
      marketFilter: filter,
      expanded,
    });
    if (snapshot === lastSavedRef.current) return;
    const id = setTimeout(() => {
      lastSavedRef.current = snapshot;
      void savePlannerPreferences({
        outreachZones: overrides,
        marketFilter: filter,
        expanded,
      })
        .then(() => syncPlannerZonesToCloud(overrides))
        .catch(() => undefined);
    }, 300);
    return () => clearTimeout(id);
  }, [prefsLoaded, overrides, filter, expanded]);

  const views = useMemo<MarketView[]>(() => {
    if (!now) return [];
    return OUTREACH_MARKETS.map((market) =>
      buildView(market, leads, overrides[market.id], now),
    );
  }, [leads, now, overrides]);

  if (!now || !ready) return null;

  const visible =
    filter === "all" ? views : views.filter((v) => v.market.id === filter);
  const activeCount = views.filter((v) => v.status === "active").length;
  const soonest = views.find((v) => v.status === "soon");

  return (
    <section className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md border border-sky-500/25 bg-sky-500/15 text-sky-300">
            <Clock className="h-3.5 w-3.5" />
          </span>
          <div>
            <h2 className="text-xs font-semibold text-white">
              Outreach Time Planner
            </h2>
            <p className="text-[11px] text-white/40">
              {activeCount > 0
                ? `${activeCount} market${activeCount === 1 ? "" : "s"} in the window now`
                : soonest
                  ? `Next up: ${soonest.market.name} · ${soonest.detail.toLowerCase()}`
                  : "Tue–Thu · 09:30–11:00 local time"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {expanded ? (
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.02] p-0.5">
              <button
                type="button"
                onClick={() => setFilter("all")}
                aria-pressed={filter === "all"}
                aria-label="All markets"
                title="All markets"
                className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                  filter === "all"
                    ? "bg-white/[0.12] text-white shadow-sm"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                <Globe className="h-3 w-3" aria-hidden />
              </button>
              {views.map((v) => (
                <button
                  key={v.market.id}
                  type="button"
                  onClick={() => setFilter(v.market.id)}
                  aria-pressed={filter === v.market.id}
                  aria-label={`Show only ${v.market.name}`}
                  title={v.market.name}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                    filter === v.market.id
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/40 hover:text-white/70"
                  }`}
                >
                  <span aria-hidden>{v.market.flag}</span>
                </button>
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="flex items-center gap-1 rounded-lg border border-white/[0.10] bg-white/[0.03] px-2.5 py-1.5 text-[11px] font-medium text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            {expanded ? "Hide" : "Planner"}
            {expanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </button>
        </div>
      </div>

      {expanded ? (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((v) => (
              <MarketCard
                key={v.market.id}
                view={v}
                onPickZone={(tz) =>
                  setOverrides((prev) => {
                    const next = { ...prev };
                    if (tz) next[v.market.id] = tz;
                    else delete next[v.market.id];
                    return next;
                  })
                }
              />
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-white/35">
            Suggested outreach windows — track your replies to discover what
            works best for each market.
          </p>
        </>
      ) : null}
    </section>
  );
}
