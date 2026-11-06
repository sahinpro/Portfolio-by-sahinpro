import Header from "@/components/Header";
import {
  ProjectsListSkeleton,
  ProjectsPageHeroSkeleton,
} from "@/views/ProjectsPage/ProjectsListSkeleton";

/**
 * Fallback while the projects page's async Server Component fetches data.
 * Reuses the hero/list skeleton sub-components directly (no Footer dependency).
 */
export default function ProjectsLoading() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start bg-[#050505]"
      aria-busy="true"
      aria-label="Loading projects"
    >
      <Header />

      <section className="relative w-full overflow-hidden pt-40 pb-16">
        <div className="container mx-auto px-4">
          <ProjectsPageHeroSkeleton />
        </div>
      </section>

      <section className="w-full scroll-mt-28 pb-28">
        <div className="container mx-auto space-y-12 px-4">
          <ProjectsListSkeleton />
        </div>
      </section>
    </main>
  );
}
