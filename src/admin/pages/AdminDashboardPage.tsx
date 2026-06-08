"use client";

import { ChartAreaInteractive } from "@/admin/components/charts/ChartAreaInteractive";
import { StatCard } from "@/admin/components/ui/StatCard";
import { ToggleSwitch } from "@/admin/components/ui/ToggleSwitch";
import { useToast } from "@/admin/context/ToastContext";
import { useDashboardData } from "@/admin/hooks/useDashboardData";
import {
  getSiteSettingsMap,
  upsertSiteSettings,
} from "@/admin/lib/siteSettings";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { COMING_SOON_MODE_KEY } from "@/lib/siteMode";
import {
  BarChart3,
  ExternalLink,
  FolderKanban,
  MessageSquareQuote,
  MonitorSmartphone,
  Plus,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

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
  const { showToast } = useToast();
  const [comingSoonMode, setComingSoonMode] = useState(false);
  const [comingSoonLoading, setComingSoonLoading] = useState(true);
  const [comingSoonSaving, setComingSoonSaving] = useState(false);

  const last30 = data.viewsByDay.slice(-30);
  const total30d = last30.reduce((a, b) => a + b.count, 0);
  const avgPerDay = last30.length ? Math.round(total30d / last30.length) : 0;

  useEffect(() => {
    let cancelled = false;

    const loadSiteMode = async () => {
      try {
        const settings = await getSiteSettingsMap();
        if (!cancelled) {
          setComingSoonMode(settings[COMING_SOON_MODE_KEY] === "enabled");
        }
      } catch (error) {
        if (!cancelled) {
          showToast(
            error instanceof Error ? error.message : "Failed to load site mode",
            "error",
          );
        }
      } finally {
        if (!cancelled) {
          setComingSoonLoading(false);
        }
      }
    };

    void loadSiteMode();
    return () => {
      cancelled = true;
    };
  }, [showToast]);

  const handleToggleComingSoon = async (nextValue: boolean) => {
    const previousValue = comingSoonMode;
    setComingSoonMode(nextValue);
    setComingSoonSaving(true);

    try {
      await upsertSiteSettings({
        [COMING_SOON_MODE_KEY]: nextValue ? "enabled" : "disabled",
      });
      invalidatePublicDataCache();
      showToast(
        nextValue ? "Coming soon mode is now active" : "Website is live again",
      );
    } catch (error) {
      setComingSoonMode(previousValue);
      showToast(
        error instanceof Error ? error.message : "Failed to update site mode",
        "error",
      );
    } finally {
      setComingSoonSaving(false);
    }
  };

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
            href="/admin/projects/new"
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
          <span className="font-medium">Note:</span> {error} check RLS and that
          you are in{" "}
          <code className="text-amber-100 font-mono text-xs">
            admin_allowlist
          </code>
          .
        </div>
      )}

      <section className="rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-4 shadow-[0_16px_50px_rgba(0,0,0,0.18)] backdrop-blur-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
              <MonitorSmartphone className="h-4.5 w-4.5 text-cyan-200" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Coming soon status
              </p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                {comingSoonMode
                  ? "Public visitors currently see the coming soon page."
                  : "Public visitors currently see the live website."}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                comingSoonMode
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-zinc-700 bg-zinc-800/70 text-zinc-300"
              }`}
            >
              {comingSoonMode ? "Active" : "Live"}
            </span>
            <ToggleSwitch
              checked={comingSoonMode}
              onChange={(nextValue) => void handleToggleComingSoon(nextValue)}
              disabled={comingSoonLoading || comingSoonSaving}
              label={comingSoonMode ? "Coming soon enabled" : "Website live"}
            />
          </div>
        </div>
      </section>

      {/* ── KPI strip ── */}
      <section>
        <SectionHeader title="At a glance" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total projects"
            value={loading ? "  " : data.totalProjects}
            sublabel={`${data.publishedProjects} published · ${data.draftProjects} draft`}
            icon={FolderKanban}
            accent="violet"
          />
          <StatCard
            label="Page views (30d)"
            value={loading ? "  " : total30d.toLocaleString()}
            sublabel={`~${avgPerDay} per day avg`}
            icon={BarChart3}
            accent="emerald"
          />
          <StatCard
            label="Testimonials"
            value={loading ? "  " : data.testimonials}
            sublabel="Published on site"
            icon={MessageSquareQuote}
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
              href="/admin/analytics"
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
