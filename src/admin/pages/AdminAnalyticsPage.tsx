import { ChartAreaInteractive } from "@/admin/components/charts/ChartAreaInteractive";
import { useDashboardData } from "@/admin/hooks/useDashboardData";
import type { PageViewRow } from "@/admin/types/database";
import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

export function AdminAnalyticsPage(): JSX.Element {
  const { data, loading, error: dashboardError, refresh } = useDashboardData();
  const [recent, setRecent] = useState<PageViewRow[]>([]);
  const [recentError, setRecentError] = useState<string | null>(null);

  const loadRecent = useCallback(async () => {
    const { data: d, error } = await supabase
      .from("page_views")
      .select("*")
      .order("visited_at", { ascending: false })
      .limit(50);
    if (error) {
      setRecentError(error.message);
      setRecent([]);
      return;
    }
    setRecentError(null);
    setRecent((d ?? []) as PageViewRow[]);
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const total30d = data.viewsByDay.slice(-30).reduce((a, b) => a + b.count, 0);
  const analyticsSecretMissing = !import.meta.env.VITE_ANALYTICS_INGEST_SECRET;

  return (
    <div className="max-w-6xl">
      {analyticsSecretMissing ? (
        <div
          className="mb-6 rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100/90"
          role="status"
        >
          Page views are not being recorded: add{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs text-amber-50/95">
            VITE_ANALYTICS_INGEST_SECRET
          </code>{" "}
          in Vercel (same string as Supabase secret{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
            ANALYTICS_INGEST_SECRET
          </code>{" "}
          on the{" "}
          <code className="rounded bg-black/30 px-1 py-0.5 text-xs">
            record-page-view
          </code>{" "}
          function), then redeploy so Vite embeds it at build time.
        </div>
      ) : null}
      {dashboardError ? (
        <div
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100/95"
          role="alert"
        >
          <span className="font-medium">Dashboard query failed:</span>{" "}
          {dashboardError} often missing{" "}
          <code className="rounded bg-black/30 px-1 text-xs">page_views</code>{" "}
          table, RLS blocking{" "}
          <code className="rounded bg-black/30 px-1 text-xs">SELECT</code> for{" "}
          <code className="rounded bg-black/30 px-1 text-xs">
            authenticated
          </code>
          , or wrong project.
        </div>
      ) : null}
      {recentError ? (
        <div
          className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100/95"
          role="alert"
        >
          <span className="font-medium">Recent visits query failed:</span>{" "}
          {recentError}
        </div>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Analytics</h1>
          <p className="text-sm text-white/45 mt-1">
            Charts read from your Supabase page view ingest. In production,{" "}
            <span className="text-white/60">@vercel/analytics</span> also sends
            data to your Vercel dashboard; Vercel does not expose that time
            series for this chart, so the graph stays on first-party data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void refresh();
            void loadRecent();
          }}
          disabled={loading}
          className="self-start rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-sm text-white/80
            disabled:opacity-50"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Views (30d)", value: loading ? "  " : total30d },
          {
            label: "Top page views",
            value: loading ? "  " : (data.topPages[0]?.count ?? 0),
          },
          {
            label: "Unique paths (30d)",
            value: loading ? "  " : data.topPages.length,
          },
          { label: "Data points", value: recent.length },
        ].map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-white/[0.08] bg-[#111] p-4"
          >
            <p className="text-[10px] uppercase tracking-wider text-white/35">
              {c.label}
            </p>
            <p className="text-2xl font-semibold text-white mt-1 tabular-nums">
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mb-10">
        <ChartAreaInteractive data={data.viewsByDay} loading={loading} />
      </div>
    </div>
  );
}
