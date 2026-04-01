import { ChartAreaInteractive } from "@/admin/components/charts/ChartAreaInteractive";
import { StatCard } from "@/admin/components/ui/StatCard";
import { useDashboardData } from "@/admin/hooks/useDashboardData";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  FolderKanban,
  Mail,
  Plus,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
      <div className="min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-white/30">
          {title}
        </h2>
        {subtitle && <p className="text-white/50 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action ? <div className="shrink-0 sm:self-end">{action}</div> : null}
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Dashboard
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            Overview of your portfolio content and traffic.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
      </section>

    </div>
  );
}
