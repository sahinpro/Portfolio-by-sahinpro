import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import { cn } from "@/lib/utils";

export type FeaturedProjectCardSkeletonProps = {
  index?: number;
};

export function FeaturedProjectCardSkeleton({
  index = 0,
}: FeaturedProjectCardSkeletonProps): JSX.Element {
  const even = index % 2 === 0;

  return (
    <div
      aria-hidden
      className="relative grid grid-cols-1 gap-0 overflow-hidden rounded-2xl border border-white/[0.08]
        bg-gradient-to-br from-white/[0.03] to-transparent lg:grid-cols-2"
    >
      <div
        className={cn(
          "relative aspect-auto h-[280px] overflow-hidden sm:h-[360px] lg:h-[480px]",
          even ? "lg:order-1" : "lg:order-2",
        )}
      >
        <SkeletonShimmer rounded="rounded-none" className="absolute inset-0" />
      </div>

      <div
        className={cn(
          "flex flex-col justify-center p-6 sm:p-8 md:p-10",
          even ? "lg:order-2" : "lg:order-1",
        )}
      >
        <div className="mb-4 flex items-center gap-2">
          <SkeletonShimmer className="h-6 w-32" rounded="rounded-md" />
          <SkeletonShimmer className="h-4 w-10" rounded="rounded" />
        </div>

        <SkeletonShimmer
          className="mb-3 h-8 w-4/5 max-w-md md:h-9"
          rounded="rounded-lg"
        />

        <div className="mb-6 space-y-2">
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-full" />
          <SkeletonShimmer className="h-4 w-2/3" />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonShimmer
              key={i}
              className="h-7 w-[4.5rem]"
              rounded="rounded-lg"
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <SkeletonShimmer className="h-10 w-40" rounded="rounded-xl" />
          <SkeletonShimmer className="h-10 w-32" rounded="rounded-xl" />
          <SkeletonShimmer className="h-10 w-28" rounded="rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export type FeaturedProjectCardSkeletonListProps = {
  count?: number;
};

export function FeaturedProjectCardSkeletonList({
  count = 2,
}: FeaturedProjectCardSkeletonListProps): JSX.Element {
  return (
    <div className="space-y-5">
      {Array.from({ length: count }).map((_, index) => (
        <FeaturedProjectCardSkeleton key={index} index={index} />
      ))}
    </div>
  );
}
