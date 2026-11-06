import Header from "@/components/Header";
import { SkeletonShimmer } from "@/components/ui/skeleton-shimmer";

/**
 * Fallback shown while the home page's async Server Component resolves
 * Supabase/Redis data. Keeps the Header visible and shimmers the hero area.
 */
export default function HomeLoading() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start bg-[#050505]"
      aria-busy="true"
      aria-label="Loading"
    >
      <Header />

      {/* Hero-area placeholder */}
      <section className="flex min-h-dvh w-full flex-col items-center justify-center px-4">
        <SkeletonShimmer className="mb-4 h-4 w-32" rounded="rounded-full" />
        <SkeletonShimmer className="mb-3 h-14 w-full max-w-2xl" />
        <SkeletonShimmer className="mb-8 h-6 w-full max-w-xl" />
        <div className="flex gap-4">
          <SkeletonShimmer className="h-12 w-40" rounded="rounded-xl" />
          <SkeletonShimmer className="h-12 w-32" rounded="rounded-xl" />
        </div>
      </section>
    </main>
  );
}
