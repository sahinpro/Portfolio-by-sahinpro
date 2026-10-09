import { cn } from "@/lib/utils";

export type SkeletonShimmerProps = {
  className?: string;
  rounded?: string;
};

/** Placeholder block with a left-to-right shimmer sweep. */
export function SkeletonShimmer({
  className,
  rounded = "rounded-md",
}: SkeletonShimmerProps): JSX.Element {
  return (
    <div aria-hidden className={cn("skeleton-shimmer", rounded, className)} />
  );
}
