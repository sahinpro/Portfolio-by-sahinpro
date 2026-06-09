import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import { ProjectCardSkeletonGrid } from "@/views/ProjectsPage/ProjectCardSkeleton";

export function ProjectsPageSkeleton(): JSX.Element {
  return (
    <main
      id="main-content"
      className="flex min-h-screen w-full flex-col items-start relative bg-[#050505] shading-effect"
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

          <div className="container mx-auto animate-pulse space-y-6 px-4">
            <div className="h-7 w-28 rounded-full bg-white/10" />
            <div className="h-14 max-w-md rounded-lg bg-white/10 md:h-16" />
            <div className="h-5 max-w-xl rounded bg-white/[0.06]" />

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-wrap gap-2">
                <div className="h-10 w-16 rounded-xl bg-white/10" />
                <div className="h-10 w-24 rounded-xl bg-white/[0.07]" />
                <div className="h-10 w-28 rounded-xl bg-white/[0.07]" />
                <div className="h-10 w-32 rounded-xl bg-white/[0.07]" />
              </div>
              <div className="h-10 w-full rounded-xl bg-white/[0.06] sm:ml-auto sm:w-60" />
            </div>
          </div>
        </section>

        <section className="w-full pb-28">
          <div className="container mx-auto px-4">
            <ProjectCardSkeletonGrid />
          </div>
        </section>

        <FooterSection />
      </div>
    </main>
  );
}
