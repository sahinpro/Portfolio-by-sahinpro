import { cn } from "@/lib/utils";
import {
  projectCardGlassBlur,
  projectCardGlassGradient,
  projectCardGlassMask,
  projectCardInnerFrame,
  projectCardShell,
} from "@/views/ProjectsPage/projectModalStyles";

export interface ProjectCardSkeletonProps {
  index?: number;
}

export function ProjectCardSkeleton({
  index = 0,
}: ProjectCardSkeletonProps): JSX.Element {
  return (
    <article
      aria-hidden
      className={projectCardShell}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative h-[22rem] overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.08]" />

        <div className="absolute top-4 right-4 z-[5] h-9 w-9 animate-pulse rounded-full border border-white/10 bg-white/[0.06]" />

        <div className={projectCardGlassGradient} />

        <div
          className={projectCardGlassBlur}
          style={{
            backdropFilter: "blur(22px)",
            WebkitBackdropFilter: "blur(22px)",
            maskImage: projectCardGlassMask,
            WebkitMaskImage: projectCardGlassMask,
          }}
        />

        <div className={cn(projectCardInnerFrame, "z-[2]")} />

        <div className="absolute inset-x-0 bottom-0 z-[3] space-y-2.5 px-5 pb-5">
          <div className="h-7 w-3/4 max-w-[220px] animate-pulse rounded-md bg-white/10" />
          <div className="h-3 w-28 animate-pulse rounded bg-[#00BB7D]/20" />
          <div className="space-y-1.5 pt-0.5">
            <div className="h-3.5 w-full animate-pulse rounded bg-white/[0.07]" />
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-white/[0.06]" />
          </div>
          <div className="h-3 w-2/3 max-w-[180px] animate-pulse rounded bg-white/[0.05]" />
        </div>
      </div>
    </article>
  );
}

const SKELETON_COUNT = 6;

export function ProjectCardSkeletonGrid(): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <ProjectCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
