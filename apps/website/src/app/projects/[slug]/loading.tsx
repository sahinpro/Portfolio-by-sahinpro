import Header from "@/components/Header";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";

/**
 * Fallback while the project detail page's async Server Component resolves.
 * Mirrors the layout of ProjectDetailPage: hero image → title → body content.
 */
export default function ProjectDetailLoading() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start bg-[#050505]"
      aria-busy="true"
      aria-label="Loading project details"
    >
      <Header />

      {/* Hero image placeholder */}
      <section className="w-full pt-24 pb-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <SkeletonShimmer className="mb-2 h-5 w-24" rounded="rounded-full" />
          <SkeletonShimmer className="mb-4 h-12 w-full max-w-lg" />
          <SkeletonShimmer className="mb-6 h-5 w-full max-w-md" />
          <div className="aspect-video w-full overflow-hidden rounded-2xl">
            <SkeletonShimmer className="h-full w-full" rounded="rounded-2xl" />
          </div>
        </div>
      </section>

      {/* Body content placeholder */}
      <section className="w-full px-4 pb-24">
        <div className="container mx-auto max-w-4xl space-y-4">
          <SkeletonShimmer className="h-8 w-48" />
          <SkeletonShimmer className="h-5 w-full" />
          <SkeletonShimmer className="h-5 w-full max-w-3xl" />
          <SkeletonShimmer className="h-5 w-full max-w-2xl" />
          <div className="pt-6">
            <SkeletonShimmer className="h-8 w-36" />
            <SkeletonShimmer className="mt-4 h-5 w-full max-w-xl" />
          </div>
        </div>
      </section>
    </main>
  );
}
