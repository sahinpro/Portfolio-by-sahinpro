import { ChartAreaInteractive } from "@/admin/components/charts/ChartAreaInteractive";
import { DashboardTopPagesBarChart } from "@/admin/components/charts/DashboardTopPagesBarChart";
import { DashboardViewsLineChart } from "@/admin/components/charts/DashboardViewsLineChart";
import { StatCard } from "@/admin/components/ui/StatCard";
import { useDashboardData } from "@/admin/hooks/useDashboardData";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Circle,
  ExternalLink,
  FolderKanban,
  Inbox,
  Mail,
  Plus,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─────────────── types ─────────────── */

type QuickLinkProps = {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sublabel: string;
  badge?: number | string;
  accent?: "violet" | "emerald" | "amber" | "blue";
};

/* ─────────────── accent map ─────────────── */

const accentCls = {
  violet: {
    dot: "bg-violet-400",
    badge: "bg-violet-500/15 text-violet-300",
    icon: "text-violet-400",
  },
  emerald: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300",
    icon: "text-emerald-400",
  },
  amber: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
    icon: "text-amber-400",
  },
  blue: {
    dot: "bg-blue-400",
    badge: "bg-blue-500/15 text-blue-300",
    icon: "text-blue-400",
  },
};

/* ─────────────── quick-link row ─────────────── */

function QuickLink({
  to,
  icon: Icon,
  label,
  sublabel,
  badge,
  accent = "violet",
}: QuickLinkProps) {
  const cls = accentCls[accent];
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/[0.06]
        bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12] transition-all duration-200"
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center ${cls.icon}`}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90 leading-tight">
          {label}
        </p>
        <p className="text-xs text-white/35 truncate mt-0.5">{sublabel}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {badge !== undefined && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${cls.badge}`}
          >
            {badge}
          </span>
        )}
        <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
      </div>
    </Link>
  );
}

/* ─────────────── section header ─────────────── */

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
          {title}
        </h2>
        {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─────────────── page ─────────────── */

export function AdminDashboardPage(): JSX.Element {
  const { data, loading, error, refresh } = useDashboardData();

  const last30 = data.viewsByDay.slice(-30);
  const total30d = last30.reduce((a, b) => a + b.count, 0);
  const avgPerDay = last30.length
    ? Math.round(total30d / last30.length)
    : 0;

  return (
    <div className="max-w-7xl space-y-8">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Dashboard
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Overview of your portfolio content and traffic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void refresh()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-white/[0.10]
              bg-white/[0.04] text-sm text-white/70 hover:bg-white/[0.07] hover:text-white
              disabled:opacity-40 transition-all duration-200"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <Link
            to="/admin/projects/new"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white
              text-black text-sm font-semibold hover:bg-white/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            New project
          </Link>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm text-amber-200/90">
          <span className="font-medium">Note:</span> {error} — check RLS and
          that you are in{" "}
          <code className="text-amber-100 font-mono text-xs">
            admin_allowlist
          </code>
          .
        </div>
      )}

      {/* ── KPI strip ── */}
      <section>
        <SectionHeader title="At a glance" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <StatCard
            label="Total projects"
            value={loading ? "—" : data.totalProjects}
            sublabel={`${data.publishedProjects} published · ${data.draftProjects} draft`}
            icon={FolderKanban}
            accent="violet"
          />
          <StatCard
            label="Page views (30d)"
            value={loading ? "—" : total30d.toLocaleString()}
            sublabel={`~${avgPerDay} per day avg`}
            icon={BarChart3}
            accent="emerald"
          />
          <StatCard
            label="Unread messages"
            value={loading ? "—" : data.unreadMessages}
            sublabel="Contact inbox"
            icon={Mail}
            accent="amber"
          />
          <StatCard
            label="Blog posts"
            value={loading ? "—" : data.blogPosts}
            sublabel="All statuses"
            icon={BookOpen}
            accent="default"
          />
        </div>
      </section>

      {/* ── Charts ── */}
      <section>
        <SectionHeader
          title="Traffic"
          subtitle="Page views over the last 30 days"
          action={
            <Link
              to="/admin/analytics"
              className="text-xs text-white/35 hover:text-white/70 inline-flex items-center gap-1 transition-colors"
            >
              View all <ExternalLink className="w-3 h-3" />
            </Link>
          }
        />
        <div className="mb-4">
          <ChartAreaInteractive data={data.viewsByDay} loading={loading} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          <DashboardViewsLineChart data={last30} />
          <DashboardTopPagesBarChart data={data.topPages} />
        </div>
      </section>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <section>
          <SectionHeader title="Quick actions" />
          <div className="space-y-2">
            <QuickLink
              to="/admin/projects/new"
              icon={FolderKanban}
              label="New project"
              sublabel="Add a portfolio case study"
              accent="violet"
            />
            <QuickLink
              to="/admin/blog/new"
              icon={BookOpen}
              label="New blog post"
              sublabel="Write and publish an article"
              accent="blue"
            />
            <QuickLink
              to="/admin/inbox"
              icon={Inbox}
              label="Contact inbox"
              sublabel="Read and respond to messages"
              badge={data.unreadMessages > 0 ? data.unreadMessages : undefined}
              accent="amber"
            />
            <QuickLink
              to="/admin/analytics"
              icon={TrendingUp}
              label="Analytics"
              sublabel="Detailed page view breakdown"
              accent="emerald"
            />
          </div>
        </section>

        {/* Top pages mini-table */}
        <section>
          <SectionHeader
            title="Top pages (30d)"
            action={
              <Link
                to="/admin/analytics"
                className="text-xs text-white/35 hover:text-white/70 inline-flex items-center gap-1 transition-colors"
              >
                Full report <ArrowUpRight className="w-3 h-3" />
              </Link>
            }
          />

          {data.topPages.length === 0 ? (
            <div
              className="rounded-xl border border-dashed border-white/[0.08] flex items-center
              justify-center h-32 text-sm text-white/30"
            >
              No page view data yet.
            </div>
          ) : (
            <div className="rounded-xl border border-white/[0.08] overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Path
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Views
                    </th>
                    <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wider text-white/30">
                      Share
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPages.map((p, i) => {
                    const pct =
                      total30d > 0 ? Math.round((p.count / total30d) * 100) : 0;
                    return (
                      <tr
                        key={p.path}
                        className={`border-b border-white/[0.04] hover:bg-white/[0.025] transition-colors
                          ${i === data.topPages.length - 1 ? "border-0" : ""}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Circle className="w-1.5 h-1.5 fill-violet-400 text-violet-400 shrink-0" />
                            <span className="font-mono text-xs text-white/70 truncate max-w-[180px]">
                              {p.path}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right text-white/70 tabular-nums text-xs font-medium">
                          {p.count.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-14 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-violet-500/60"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/35 tabular-nums w-7 text-right">
                              {pct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
