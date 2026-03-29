import { DashboardTopPagesBarChart } from "@/admin/components/charts/DashboardTopPagesBarChart";
import { DashboardViewsLineChart } from "@/admin/components/charts/DashboardViewsLineChart";
import { StatCard } from "@/admin/components/ui/StatCard";
import { useDashboardData } from "@/admin/hooks/useDashboardData";
import { BookOpen, FolderKanban, Inbox, Mail, Plus, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export function AdminDashboardPage(): JSX.Element {
  const { data, loading, error, refresh } = useDashboardData();

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Dashboard</h1>
          <p className="text-sm text-white/45 mt-2 max-w-xl leading-relaxed">
            Content, contact inbox, and traffic at a glance. Use the cards below to jump into
            each area.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-white/[0.12]
            bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.08]
            disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error ? (
        <p className="mb-6 rounded-lg border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-200/90">
          {error} — check RLS and that you are in <code className="text-amber-100">admin_allowlist</code>.
        </p>
      ) : null}

      <section className="mb-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-3">
          At a glance
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total projects"
            value={loading ? "—" : data.totalProjects}
            sublabel={`${data.draftProjects} draft · ${data.publishedProjects} published`}
            icon={FolderKanban}
            accent="violet"
          />
          <StatCard
            label="Published"
            value={loading ? "—" : data.publishedProjects}
            sublabel="Visible on the public site"
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

      <section className="mb-10">
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-3">
          Traffic
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DashboardViewsLineChart data={data.viewsByDay} />
          <DashboardTopPagesBarChart data={data.topPages} />
        </div>
      </section>

      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/35 mb-3">
          Quick actions
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link
            to="/admin/projects"
            className="group flex flex-col rounded-xl border border-white/[0.08] bg-[#111] p-5 transition-colors
              hover:border-white/[0.14] hover:bg-[#141414]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-white mb-4">
              <Plus className="h-5 w-5" />
            </div>
            <p className="font-semibold text-white">Projects</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Manage portfolio case studies and build metadata.
            </p>
            <span className="mt-4 text-xs font-medium text-white/50 group-hover:text-white/80">
              Open projects →
            </span>
          </Link>

          <Link
            to="/admin/blog"
            className="group flex flex-col rounded-xl border border-white/[0.08] bg-[#111] p-5 transition-colors
              hover:border-white/[0.14] hover:bg-[#141414]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-white mb-4">
              <Plus className="h-5 w-5" />
            </div>
            <p className="font-semibold text-white">New blog post</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Create or edit posts and cover images.
            </p>
            <span className="mt-4 text-xs font-medium text-white/50 group-hover:text-white/80">
              Open blog →
            </span>
          </Link>

          <Link
            to="/admin/inbox"
            className="group flex flex-col rounded-xl border border-white/[0.08] bg-[#111] p-5 transition-colors
              hover:border-white/[0.14] hover:bg-[#141414]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/[0.06] text-white mb-4">
              <Inbox className="h-5 w-5" />
            </div>
            <p className="font-semibold text-white">Contact inbox</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              Read submissions and update status.
            </p>
            <span className="mt-4 text-xs font-medium text-white/50 group-hover:text-white/80">
              Open inbox →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
