import { FeaturedProjectCardSkeletonList } from "@/components/projects/FeaturedProjectCardSkeleton";
import { SectionHeader } from "@/components/sections";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";
import {
  sectionHeaderWrapClass,
  sectionInnerClass,
  sectionShellClass,
} from "@/constants/layout";

const HOMEPAGE_FEATURED_LIMIT = 3;

export function FeaturedProjectsSectionSkeleton(): JSX.Element {
  return (
    <section
      className={sectionShellClass}
      aria-busy="true"
      aria-label="Loading featured projects"
    >
      <div className={`${sectionInnerClass} items-center`}>
        <div className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Featured projects"
            description="Selected client work    from e-commerce stores to full-stack web applications."
          />
        </div>

        <div className="w-full">
          <FeaturedProjectCardSkeletonList count={HOMEPAGE_FEATURED_LIMIT} />
        </div>

        <div className="flex justify-center">
          <SkeletonShimmer className="h-11 w-44" rounded="rounded-xl" />
        </div>
      </div>
    </section>
  );
}
