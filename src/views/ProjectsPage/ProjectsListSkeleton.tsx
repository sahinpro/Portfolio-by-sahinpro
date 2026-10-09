import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { PROJECTS_PER_PAGE } from "@/views/ProjectsPage/ProjectsPagination";
import { ProjectCardSkeletonGrid } from "@/views/ProjectsPage/ProjectCardSkeleton";

export type ProjectsListSkeletonProps = {
  gridCount?: number;
};

/** Matches `/projects` content: project card grid. */
export function ProjectsListSkeleton({
  gridCount = PROJECTS_PER_PAGE,
}: ProjectsListSkeletonProps): JSX.Element {
  return (
    <div aria-hidden>
      <ProjectCardSkeletonGrid count={gridCount} />
    </div>
  );
}

export type ProjectsPageHeroSkeletonProps = {
  filterCount?: number;
};

export function ProjectsPageHeroSkeleton({
  filterCount = 4,
}: ProjectsPageHeroSkeletonProps): JSX.Element {
  return (
    <div aria-hidden>
      <SkeletonShimmer className="mb-4 h-7 w-28" rounded="rounded-full" />
      <SkeletonShimmer className="mb-4 h-12 max-w-xs rounded-lg md:h-16 md:max-w-md" />
      <SkeletonShimmer className="mb-10 h-6 max-w-xl" />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: filterCount }).map((_, i) => (
            <SkeletonShimmer
              key={i}
              className={cn(
                "h-10 rounded-xl",
                i === 0 ? "w-16" : i === 1 ? "w-24" : i === 2 ? "w-28" : "w-32",
              )}
            />
          ))}
        </div>
        <SkeletonShimmer className="h-10 w-full rounded-xl sm:ml-auto sm:w-60" />
      </div>
    </div>
  );
}
