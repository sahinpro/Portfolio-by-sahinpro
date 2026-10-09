import { formatStorageSize } from "@/admin/lib/storageMetrics";
import type { StorageMetrics } from "@/admin/lib/storageMetrics";
import { HardDrive } from "lucide-react";

type StorageStatCardProps = {
  metrics: StorageMetrics;
  loading: boolean;
  refreshing: boolean;
  live: boolean;
  error: string | null;
};

export function StorageStatCard({
  metrics,
  loading,
  refreshing,
  live,
  error,
}: StorageStatCardProps): JSX.Element {
  const usagePercent = loading ? 0 : metrics.usagePercent;

  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] p-5
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/[0.02] opacity-40 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
              Storage left
            </p>
            {!loading && !error ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200/90">
                <span
                  className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${
                    live ? "animate-pulse" : ""
                  }`}
                />
                {live ? "Live" : refreshing ? "Syncing" : "Polling"}
              </span>
            ) : null}
          </div>

          <p
            className={`mt-2 text-3xl font-semibold tabular-nums text-white transition-opacity duration-200 ${
              refreshing && !loading ? "opacity-80" : ""
            }`}
          >
            {loading ? "—" : formatStorageSize(metrics.remainingBytes)}
          </p>

          {error ? (
            <p className="mt-1.5 text-xs leading-relaxed text-amber-200/80">{error}</p>
          ) : (
            <p className="mt-1.5 text-xs leading-relaxed text-white/35">
              {loading
                ? "Calculating usage…"
                : `${formatStorageSize(metrics.totalBytes)} used of ${formatStorageSize(metrics.quotaBytes)} · ${metrics.fileCount.toLocaleString()} file${
                    metrics.fileCount === 1 ? "" : "s"
                  }`}
            </p>
          )}

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                usagePercent >= 90
                  ? "bg-red-400"
                  : usagePercent >= 75
                    ? "bg-amber-400"
                    : "bg-emerald-400"
              }`}
              style={{ width: loading ? "0%" : `${Math.max(usagePercent, 2)}%` }}
            />
          </div>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/50">
          <HardDrive className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
