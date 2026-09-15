import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { PROJECTS_PER_PAGE } from "@/views/ProjectsPage/ProjectsPagination";
import {
  projectCardInnerFrame,
  projectCardShell,
} from "@/views/ProjectsPage/projectCardStyles";

export type ProjectCardSkeletonProps = {
  index?: number;
};

/** Mirrors `ProjectCard` + `ProjectCardTeaser` so loading does not shift layout. */
export function ProjectCardSkeleton({
  index = 0,
}: ProjectCardSkeletonProps): JSX.Element {
  return (
    <article
      aria-hidden
      className={cn(
        projectCardShell,
        "grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(11rem,42%)_minmax(0,1fr)]",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div
        className={cn(
          projectCardInnerFrame,
          "z-[2] hidden sm:col-span-2 sm:block",
        )}
      />

      <div className="relative aspect-[3/2] w-full self-center overflow-hidden">
        <SkeletonShimmer rounded="rounded-none" className="absolute inset-0" />
      </div>

      <div className="relative flex min-h-[16.5rem] flex-col">
        <div className="relative z-[3] flex h-full min-w-0 flex-col justify-center px-5 py-5 sm:px-6 sm:py-6">
          <SkeletonShimmer className="h-3 w-24" rounded="rounded" />
          <SkeletonShimmer
            className="mt-1.5 h-7 w-3/4 max-w-[260px] sm:h-8"
            rounded="rounded-md"
          />
          <SkeletonShimmer className="mt-1.5 h-4 w-36" rounded="rounded" />
          <div className="mt-3 space-y-1.5">
            <SkeletonShimmer className="h-3.5 w-full" />
            <SkeletonShimmer className="h-3.5 w-4/5" />
          </div>
          <SkeletonShimmer className="mt-2.5 h-3 w-48" rounded="rounded" />
          <SkeletonShimmer className="mt-4 h-8 w-40" rounded="rounded-lg" />
        </div>
      </div>
    </article>
  );
}

export type ProjectCardSkeletonGridProps = {
  count?: number;
};

export function ProjectCardSkeletonGrid({
  count = PROJECTS_PER_PAGE,
}: ProjectCardSkeletonGridProps): JSX.Element {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
