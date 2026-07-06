import { FeaturedProjectCardSkeletonList } from "@/components/projects/FeaturedProjectCardSkeleton";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";
import { PROJECTS_PER_PAGE } from "@/views/ProjectsPage/ProjectsPagination";
import { ProjectCardSkeletonGrid } from "@/views/ProjectsPage/ProjectCardSkeleton";

export type ProjectsListSkeletonProps = {
  featuredCount?: number;
  gridCount?: number;
  showMoreLabel?: boolean;
};

/** Matches `/projects` content: featured cards, optional label, then grid. */
export function ProjectsListSkeleton({
  featuredCount = 2,
  gridCount = PROJECTS_PER_PAGE,
  showMoreLabel = true,
}: ProjectsListSkeletonProps): JSX.Element {
  return (
    <div className="space-y-12" aria-hidden>
      {featuredCount > 0 ? (
        <FeaturedProjectCardSkeletonList count={featuredCount} />
      ) : null}

      {gridCount > 0 ? (
        <>
          {showMoreLabel && featuredCount > 0 ? (
            <SkeletonShimmer className="h-4 w-32" rounded="rounded" />
          ) : null}
          <ProjectCardSkeletonGrid count={gridCount} />
        </>
      ) : null}
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
    <div className="space-y-6" aria-hidden>
      <SkeletonShimmer className="h-7 w-28" rounded="rounded-full" />
      <SkeletonShimmer className="h-14 max-w-md rounded-lg md:h-16" />
      <SkeletonShimmer className="h-5 max-w-xl" />

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
