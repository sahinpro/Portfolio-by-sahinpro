import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { PROJECTS_PER_PAGE } from "@/views/ProjectsPage/ProjectsPagination";
import {
  projectCardInnerFrame,
  projectCardShell,
} from "@/views/ProjectsPage/projectModalStyles";

export type ProjectCardSkeletonProps = {
  index?: number;
};

export function ProjectCardSkeleton({
  index = 0,
}: ProjectCardSkeletonProps): JSX.Element {
  return (
    <article
      aria-hidden
      className={cn(
        projectCardShell,
        "grid grid-cols-1 sm:grid-cols-[minmax(11rem,42%)_minmax(0,1fr)]",
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="relative aspect-[16/11] min-h-[11rem] overflow-hidden sm:aspect-auto sm:min-h-[13.5rem]">
        <SkeletonShimmer rounded="rounded-none" className="absolute inset-0" />
      </div>

      <div className="relative flex flex-col justify-center space-y-2.5 px-5 py-5 sm:px-6 sm:py-6">
        <div className={cn(projectCardInnerFrame, "hidden sm:block")} />
        <SkeletonShimmer className="h-3 w-24" rounded="rounded" />
        <SkeletonShimmer
          className="h-7 w-3/4 max-w-[220px]"
          rounded="rounded-md"
        />
        <SkeletonShimmer className="h-4 w-40" rounded="rounded" />
        <div className="space-y-1.5 pt-1">
          <SkeletonShimmer className="h-3.5 w-full" />
          <SkeletonShimmer className="h-3.5 w-4/5" />
        </div>
        <SkeletonShimmer className="mt-2 h-4 w-28" rounded="rounded" />
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
