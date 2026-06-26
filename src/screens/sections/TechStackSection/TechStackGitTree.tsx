import { scrollViewport, sectionEase } from "@/constants/scrollMotion";
import type { TechStackGroup } from "@/constants/techStack";
import { motion } from "framer-motion";
import { TechStackBadge } from "./TechStackBadge";

type TechStackGitTreeProps = {
  groups: readonly TechStackGroup[];
};

export function TechStackGitTree({
  groups,
}: TechStackGitTreeProps): JSX.Element {
  return (
    <div className="relative mx-auto w-full max-w-4xl">
      <div
        className="pointer-events-none absolute bottom-2 left-[11px] top-2 w-px bg-gradient-to-b from-emerald-500/50 via-emerald-500/25 to-transparent sm:left-[13px]"
        aria-hidden
      />

      <div className="flex flex-col gap-7 sm:gap-8">
        {groups.map((group, index) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={scrollViewport}
            transition={{
              duration: 0.45,
              delay: index * 0.07,
              ease: sectionEase,
            }}
            className="relative flex gap-3 sm:gap-4"
          >
            <div className="relative w-7 shrink-0 sm:w-8">
              <div
                className="absolute left-[11px] top-4 z-10 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/70 bg-[#050505] sm:left-[13px]"
                aria-hidden
              />
              <div
                className="absolute left-[11px] top-4 h-px w-full bg-emerald-500/35 sm:left-[13px]"
                aria-hidden
              />
            </div>

            <div className="min-w-0 flex-1 pt-2">
              <p className="mb-2.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35 sm:text-[11px]">
                {group.title}
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {group.items.map((item) => (
                  <TechStackBadge key={item.name} item={item} />
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
