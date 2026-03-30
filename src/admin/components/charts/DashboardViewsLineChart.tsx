import type { ViewsByDay } from "../../hooks/useDashboardData";
import type { ReactElement } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: ViewsByDay[];
  emptyHint?: string;
};

export function DashboardViewsLineChart({
  data,
  emptyHint = "No views recorded in the last 30 days.",
}: Props): ReactElement {
  const hasViews = data.some((d) => d.count > 0);
  const chartData = data.map((d) => ({
    ...d,
    shortLabel: d.label,
  }));

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Page views</h3>
        <p className="text-xs text-white/40 mt-0.5">Last 30 days</p>
      </div>
      {!hasViews ? (
        <div
          className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-white/[0.08]
          text-sm text-white/35"
        >
          {emptyHint}
        </div>
      ) : (
        <div className="h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "rgba(255,255,255,0.6)" }}
                itemStyle={{ color: "#fff" }}
              />
              <Line
                type="monotone"
                dataKey="count"
                name="Views"
                stroke="rgba(255,255,255,0.85)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#fff" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
