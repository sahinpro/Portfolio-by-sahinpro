import type { ViewsByDay } from "@/admin/hooks/useDashboardData";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useId, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const SERIES_LABEL: Record<string, string> = {
  desktop: "Desktop",
  mobile: "Mobile",
};

type RangeKey = "90d" | "30d" | "7d";

const RANGES: {
  key: RangeKey;
  label: string;
  slice: number;
  description: string;
}[] = [
  {
    key: "90d",
    label: "Last 3 months",
    slice: 90,
    description: "Total for the last 3 months",
  },
  {
    key: "30d",
    label: "Last 30 days",
    slice: 30,
    description: "Total for the last 30 days",
  },
  {
    key: "7d",
    label: "Last 7 days",
    slice: 7,
    description: "Total for the last 7 days",
  },
];

type Props = {
  data: ViewsByDay[];
  loading?: boolean;
};

export function ChartAreaInteractive({
  data,
  loading = false,
}: Props): JSX.Element {
  const uid = useId().replace(/:/g, "");
  const fillDesktopId = `fillDesktop-${uid}`;
  const fillMobileId = `fillMobile-${uid}`;

  const [range, setRange] = useState<RangeKey>("90d");
  const [showDesktop, setShowDesktop] = useState(true);
  const [showMobile, setShowMobile] = useState(true);

  const meta = RANGES.find((r) => r.key === range) ?? RANGES[0];

  const chartData = useMemo(() => {
    const n = meta.slice;
    return data.slice(-n);
  }, [data, meta.slice]);

  const hasAnyViews = chartData.some(
    (d) => d.desktop > 0 || d.mobile > 0,
  );

  const visibleSeries =
    (showDesktop ? 1 : 0) + (showMobile ? 1 : 0);

  return (
    <Card
      className={cn(
        "rounded-xl border border-white/[0.08] bg-[#111] text-card-foreground shadow",
      )}
    >
      <CardHeader
        className={cn(
          "flex flex-col gap-4 p-6 pb-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6",
        )}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <CardTitle className="text-base text-white">Total visitors</CardTitle>
          <CardDescription className="text-white/45">
            <span className="hidden min-[540px]:block">{meta.description}</span>
            <span className="min-[540px]:hidden">{meta.label}</span>
          </CardDescription>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-3 sm:max-w-none sm:items-end">
          <fieldset
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-0 p-0 text-xs text-white/55"
            aria-label="Series to display"
          >
            <legend className="sr-only">Series to display</legend>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={showDesktop}
                onChange={(e) => setShowDesktop(e.target.checked)}
                className={cn(
                  "size-4 shrink-0 rounded border border-white/20 bg-white/[0.04]",
                  "text-white accent-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
                )}
              />
              <span className="text-white/75">{SERIES_LABEL.desktop}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 select-none">
              <input
                type="checkbox"
                checked={showMobile}
                onChange={(e) => setShowMobile(e.target.checked)}
                className={cn(
                  "size-4 shrink-0 rounded border border-white/20 bg-white/[0.04]",
                  "text-white accent-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40",
                )}
              />
              <span className="text-white/75">{SERIES_LABEL.mobile}</span>
            </label>
          </fieldset>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <div
              className={cn(
                "hidden w-full flex-wrap gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] p-1 md:flex md:w-auto",
              )}
              role="group"
              aria-label="Date range"
            >
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRange(r.key)}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-xs font-medium transition-colors md:px-4",
                    range === r.key
                      ? "bg-white/[0.12] text-white shadow-sm"
                      : "text-white/45 hover:text-white/75",
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <div className="w-full md:hidden">
              <label className="sr-only" htmlFor={`chart-range-${uid}`}>
                Date range
              </label>
              <select
                id={`chart-range-${uid}`}
                value={range}
                onChange={(e) => setRange(e.target.value as RangeKey)}
                className={cn(
                  "h-9 w-full max-w-full rounded-md border border-white/[0.08] bg-white/[0.04] px-3 text-sm text-white",
                  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/30",
                )}
              >
                {RANGES.map((r) => (
                  <option key={r.key} value={r.key} className="bg-[#111]">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-2 pb-4 pt-0 sm:px-6 sm:pt-2">
        {loading ? (
          <div
            className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-white/[0.08]
              text-sm text-white/35 sm:h-[280px]"
          >
            Loading chart…
          </div>
        ) : !hasAnyViews ? (
          <div
            className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-white/[0.08]
              text-sm text-white/35 sm:h-[280px]"
          >
            No views in this range yet.
          </div>
        ) : visibleSeries === 0 ? (
          <div
            className="flex h-[250px] items-center justify-center rounded-lg border border-dashed border-white/[0.08]
              text-sm text-white/35 sm:h-[280px]"
          >
            Select at least one series above.
          </div>
        ) : (
          <div className="aspect-auto h-[250px] w-full min-w-0 pt-2 sm:h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id={fillDesktopId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgba(255,255,255,0.45)"
                      stopOpacity={1}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgba(255,255,255,0.45)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id={fillMobileId} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="rgba(255,255,255,0.28)"
                      stopOpacity={0.85}
                    />
                    <stop
                      offset="95%"
                      stopColor="rgba(255,255,255,0.28)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                  interval="preserveStartEnd"
                  minTickGap={range === "7d" ? 8 : 24}
                  ticks={
                    range === "7d" && chartData.length > 0
                      ? chartData.map((d) => d.label)
                      : undefined
                  }
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  width={36}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const filtered = payload.filter((p) => {
                      const key = String(p.dataKey);
                      if (key === "desktop") return showDesktop;
                      if (key === "mobile") return showMobile;
                      return true;
                    });
                    if (!filtered.length) return null;
                    return (
                      <div
                        className="rounded-lg border border-white/10 bg-[#1a1a1a] px-3 py-2 shadow-xl"
                        style={{ fontSize: 12 }}
                      >
                        <p className="mb-1.5 font-medium text-white/80">
                          {label}
                        </p>
                        <div className="grid gap-1">
                          {filtered.map((p) => (
                            <div
                              key={String(p.dataKey)}
                              className="flex items-center justify-between gap-6 text-white"
                            >
                              <span className="text-white/55">
                                {SERIES_LABEL[String(p.dataKey)] ?? p.name}:
                              </span>
                              <span className="font-medium tabular-nums">
                                {typeof p.value === "number"
                                  ? p.value.toLocaleString()
                                  : p.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                {showMobile ? (
                  <Area
                    type="natural"
                    dataKey="mobile"
                    name="mobile"
                    stackId={
                      showDesktop && showMobile ? "visitors" : undefined
                    }
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth={1}
                    fill={`url(#${fillMobileId})`}
                    dot={false}
                    activeDot={{ r: 3, fill: "#fff", strokeWidth: 0 }}
                  />
                ) : null}
                {showDesktop ? (
                  <Area
                    type="natural"
                    dataKey="desktop"
                    name="desktop"
                    stackId={
                      showDesktop && showMobile ? "visitors" : undefined
                    }
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth={1}
                    fill={`url(#${fillDesktopId})`}
                    dot={false}
                    activeDot={{ r: 3, fill: "#fff", strokeWidth: 0 }}
                  />
                ) : null}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
