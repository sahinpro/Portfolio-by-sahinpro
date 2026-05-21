import type { PortfolioStat } from "@/screens/sections/StatsSection/statsData";

export const PortfolioStatCard = ({ stat }: { stat: PortfolioStat }): JSX.Element => {
  const Icon = stat.icon;
  return (
    <div
      className={`relative flex flex-col items-center gap-3 p-5 sm:p-6 rounded-2xl border bg-gradient-to-br ${stat.color} ${stat.border}
      backdrop-blur-sm hover:-translate-y-1 transition-transform duration-300 group overflow-hidden`}
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white/80" />
      </div>
      <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
        {stat.value}
      </p>
      <p className="text-xs sm:text-sm text-white/50 text-center leading-tight">
        {stat.label}
      </p>
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/[0.03] blur-xl pointer-events-none" />
    </div>
  );
};
