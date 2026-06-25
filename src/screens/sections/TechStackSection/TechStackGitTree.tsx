import {
  scrollViewport,
  sectionEase,
} from "@/constants/scrollMotion";
import type { TechStackGroup } from "@/constants/techStack";
import { motion } from "framer-motion";
import { TechStackBadge } from "./TechStackBadge";

const BRANCH_SLUGS: Record<string, string> = {
  Frontend: "feat/frontend",
  "Backend & CMS": "feat/backend-cms",
  "Tooling & Workflow": "chore/tooling",
};

type TechStackGitTreeProps = {
  groups: readonly TechStackGroup[];
};

export function TechStackGitTree({ groups }: TechStackGitTreeProps): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <p className="mb-6 font-mono text-[11px] text-emerald-400/55 sm:text-xs">
        <span className="text-emerald-400/80">$</span> git log --oneline --graph
        --decorate
      </p>

      {/* Main trunk */}
      <div
        className="pointer-events-none absolute bottom-6 left-3 top-10 w-px bg-gradient-to-b from-emerald-500/70 via-emerald-500/35 to-emerald-500/10 sm:left-4"
        aria-hidden
      />

      <div className="flex flex-col">
        {groups.map((group, index) => {
          const isLast = index === groups.length - 1;
          const branch = BRANCH_SLUGS[group.title] ?? group.title.toLowerCase();

          return (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={scrollViewport}
              transition={{
                duration: 0.45,
                delay: index * 0.08,
                ease: sectionEase,
              }}
              className="relative flex gap-3 pb-8 last:pb-0 sm:gap-5"
            >
              {/* Graph gutter: node + horizontal branch */}
              <div className="relative w-8 shrink-0 sm:w-10">
                <div
                  className="absolute left-3 top-5 z-10 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-emerald-400/80 bg-[#050505] shadow-[0_0_14px_rgba(52,211,153,0.28)] sm:left-4"
                  aria-hidden
                />
                <div
                  className="absolute left-3 top-5 h-px w-full bg-emerald-500/45 sm:left-4"
                  aria-hidden
                />
              </div>

              {/* Branch content */}
              <div className="min-w-0 flex-1 pt-1">
                <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-mono text-[11px] sm:text-xs">
                  <span className="text-emerald-500/55">
                    {isLast ? "└──" : "├──"}
                  </span>
                  <span className="text-emerald-300/90">{branch}</span>
                  <span className="hidden text-white/20 sm:inline">·</span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {group.title}
                  </span>
                </div>

                <div
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-3 backdrop-blur-sm sm:p-4"
                >
                  <div className="flex flex-wrap gap-2 sm:gap-2.5">
                    {group.items.map((item) => (
                      <TechStackBadge key={item.name} item={item} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
