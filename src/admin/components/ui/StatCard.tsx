import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: LucideIcon;
  accent?: "default" | "emerald" | "amber" | "violet";
};

const accentRing: Record<NonNullable<StatCardProps["accent"]>, string> = {
  default: "from-white/10 to-white/[0.02]",
  emerald: "from-emerald-500/20 to-emerald-500/[0.02]",
  amber: "from-amber-500/20 to-amber-500/[0.02]",
  violet: "from-violet-500/20 to-violet-500/[0.02]",
};

export function StatCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent = "default",
}: StatCardProps): JSX.Element {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#111] p-5
        shadow-[0_0_0_1px_rgba(255,255,255,0.02)_inset]"
    >
      <div
        className={`pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br opacity-40 blur-2xl ${accentRing[accent]}`}
      />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            {label}
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-white">{value}</p>
          {sublabel ? (
            <p className="mt-1.5 text-xs text-white/35 leading-relaxed">{sublabel}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/[0.08]
              bg-white/[0.04] text-white/50"
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </div>
  );
}
