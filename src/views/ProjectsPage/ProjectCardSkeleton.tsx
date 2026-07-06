import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { PROJECTS_PER_PAGE } from "@/views/ProjectsPage/ProjectsPagination";
import {
  projectCardInnerFrame,
  projectCardShell,
  projectHeroHeight,
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
      className={projectCardShell}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className={cn("relative overflow-hidden", projectHeroHeight)}>
        <SkeletonShimmer rounded="rounded-none" className="absolute inset-0" />

        <div className="absolute top-4 right-4 z-[5]">
          <SkeletonShimmer className="h-9 w-9" rounded="rounded-full" />
        </div>

        <div className={cn(projectCardInnerFrame, "z-[2]")} />

        <div className="absolute inset-x-0 bottom-0 z-[3] space-y-2.5 px-5 pb-5">
          <SkeletonShimmer className="h-7 w-3/4 max-w-[220px]" rounded="rounded-md" />
          <SkeletonShimmer className="h-3 w-28" rounded="rounded" />
          <div className="space-y-1.5 pt-0.5">
            <SkeletonShimmer className="h-3.5 w-full" />
            <SkeletonShimmer className="h-3.5 w-4/5" />
          </div>
          <SkeletonShimmer className="h-3 w-2/3 max-w-[180px]" />
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
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ProjectCardSkeleton key={i} index={i} />
      ))}
    </div>
  );
}
