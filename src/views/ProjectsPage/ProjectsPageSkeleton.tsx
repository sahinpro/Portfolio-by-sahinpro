import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import {
  ProjectsListSkeleton,
  ProjectsPageHeroSkeleton,
} from "@/views/ProjectsPage/ProjectsListSkeleton";

export function ProjectsPageSkeleton(): JSX.Element {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col items-start bg-[#050505] shading-effect"
      aria-busy="true"
      aria-label="Loading projects"
    >
      <div className="relative z-[1] flex w-full flex-col">
        <Header />

        <section className="relative w-full overflow-hidden pt-40 pb-16">
          <div
            className="pointer-events-none absolute -top-32 right-1/3 h-[400px] w-[500px] rounded-full
              bg-gradient-to-b from-blue-600/8 via-violet-600/5 to-transparent blur-3xl"
          />

          <div className="container mx-auto px-4">
            <ProjectsPageHeroSkeleton />
          </div>
        </section>

        <section className="w-full scroll-mt-28 pb-28">
          <div className="container mx-auto px-4">
            <ProjectsListSkeleton featuredCount={2} showMoreLabel />
          </div>
        </section>

        <FooterSection />
      </div>
    </main>
  );
}
