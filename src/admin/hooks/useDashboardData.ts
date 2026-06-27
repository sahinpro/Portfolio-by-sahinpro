import { supabase } from "@/utils/supabase";
import { useCallback, useEffect, useState } from "react";

export type ViewsByDay = {
  date: string;
  label: string;
  count: number;
  /** Inferred from `user_agent` when present. */
  mobile: number;
  desktop: number;
};
export type TopPage = { path: string; count: number };

export type DashboardData = {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  viewsByDay: ViewsByDay[];
  topPages: TopPage[];
};

/** Max history kept for analytics charts and aggregates. */
export const ANALYTICS_LOOKBACK_DAYS = 30;

const emptyData: DashboardData = {
  totalProjects: 0,
  publishedProjects: 0,
  draftProjects: 0,
  viewsByDay: [],
  topPages: [],
};

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildLastNDaysKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  return keys;
}

function isMobileUserAgent(ua: string | null | undefined): boolean {
  if (!ua) return false;
  return /Mobile|Android|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    ua,
  );
}

export function useDashboardData(): {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  refresh: () => void;
} {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const since = new Date();
      since.setDate(since.getDate() - ANALYTICS_LOOKBACK_DAYS);
      const sinceIso = since.toISOString();

      const viewsPromise = supabase
        .from("page_views")
        .select("path, visited_at, user_agent")
        .gte("visited_at", sinceIso)
        .order("visited_at", { ascending: false })
        .limit(15000);

      const projectsTotal = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });
      const projectsPublished = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "published");
      const viewsRes = await viewsPromise;

      const total = projectsTotal.count ?? 0;
      const published = projectsPublished.count ?? 0;

      const dayKeys = buildLastNDaysKeys(ANALYTICS_LOOKBACK_DAYS);
      const byDayMobile = new Map<string, number>();
      const byDayDesktop = new Map<string, number>();
      for (const k of dayKeys) {
        byDayMobile.set(k, 0);
        byDayDesktop.set(k, 0);
      }

      const pathCounts = new Map<string, number>();

      if (!viewsRes.error && viewsRes.data) {
        for (const row of viewsRes.data) {
          const day = row.visited_at?.slice(0, 10);
          if (day && byDayMobile.has(day)) {
            if (isMobileUserAgent(row.user_agent)) {
              byDayMobile.set(day, (byDayMobile.get(day) ?? 0) + 1);
            } else {
              byDayDesktop.set(day, (byDayDesktop.get(day) ?? 0) + 1);
            }
          }
          const p = row.path || "/";
          pathCounts.set(p, (pathCounts.get(p) ?? 0) + 1);
        }
      }

      const viewsByDay: ViewsByDay[] = dayKeys.map((date) => {
        const mobile = byDayMobile.get(date) ?? 0;
        const desktop = byDayDesktop.get(date) ?? 0;
        return {
          date,
          label: formatDayLabel(date),
          mobile,
          desktop,
          count: mobile + desktop,
        };
      });

      const topPages: TopPage[] = [...pathCounts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([path, count]) => ({ path, count }));

      setData({
        totalProjects: total,
        publishedProjects: published,
        draftProjects: Math.max(0, total - published),
        viewsByDay,
        topPages,
      });

      const errMsg =
        projectsTotal.error?.message ||
        projectsPublished.error?.message ||
        viewsRes.error?.message;
      if (errMsg) setError(errMsg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
      setData(emptyData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
