import type { LucideIcon } from "lucide-react";

export type WorkProcessStep = {
  step: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  border: string;
};

export const WorkProcessPanel = ({
  steps,
}: {
  steps: WorkProcessStep[];
}): JSX.Element => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
    {steps.map((step, i) => {
      const Icon = step.icon;
      return (
        <div key={step.step} className="relative min-h-0">
          {i < steps.length - 1 ? (
            <div
              className="hidden lg:block absolute top-14 left-[calc(50%+28px)] w-[calc(100%+16px-56px)] h-px pointer-events-none z-0"
              aria-hidden
            >
              <div className="h-full w-full bg-gradient-to-r from-white/15 via-white/8 to-transparent" />
            </div>
          ) : null}

          <div
            className={`relative z-[1] flex h-full flex-col gap-4 p-6 sm:p-7 rounded-2xl border
            bg-gradient-to-br backdrop-blur-sm overflow-hidden
            transition-all duration-300 group
            hover:-translate-y-1 hover:shadow-xl hover:shadow-black/25
            ${step.accent} ${step.border}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/10">
                <Icon className="size-6 text-white/90" />
              </div>
              <span
                className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-widest uppercase
                bg-white/5 border border-white/10 text-zinc-400 tabular-nums"
              >
                {step.step}
              </span>
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <h3 className="[font-family:'Inter_Display-Medium',Helvetica] text-lg font-medium text-white tracking-tight">
                {step.title}
              </h3>
              <p
                className="[font-family:'Inter_Display-Regular',Helvetica] text-sm text-[#999999] leading-relaxed
                tracking-[-0.14px]"
              >
                {step.description}
              </p>
            </div>

            <div
              className="pointer-events-none absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/[0.04] blur-xl"
              aria-hidden
            />
          </div>
        </div>
      );
    })}
  </div>
);
