import type { TopPage } from "@/admin/hooks/useDashboardData";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: TopPage[];
  emptyHint?: string;
};

export function DashboardTopPagesBarChart({
  data,
  emptyHint = "No page data yet.",
}: Props): JSX.Element {
  const chartData = data.map((d) => ({
    path:
      d.path.length > 22 ? `${d.path.slice(0, 20)}…` : d.path,
    fullPath: d.path,
    count: d.count,
  }));

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#111] p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-white">Top pages</h3>
        <p className="text-xs text-white/40 mt-0.5">By views (30 days)</p>
      </div>
      {data.length === 0 ? (
        <div
          className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-white/[0.08]
          text-sm text-white/35"
        >
          {emptyHint}
        </div>
      ) : (
        <div className="h-[260px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="path"
                width={88}
                tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: "#1a1a1a",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [value, "Views"]}
                labelFormatter={(_, payload) =>
                  payload?.[0]?.payload?.fullPath ?? ""
                }
              />
              <Bar
                dataKey="count"
                name="Views"
                fill="rgba(139, 92, 246, 0.55)"
                radius={[0, 4, 4, 0]}
                maxBarSize={28}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
