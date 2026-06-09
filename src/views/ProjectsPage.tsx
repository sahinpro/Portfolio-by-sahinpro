"use client";

import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { usePublishedProjects } from "@/hooks/usePublishedProjects";
import { ProjectCard } from "@/views/ProjectsPage/ProjectCard";
import { ProjectsPageSkeleton } from "@/views/ProjectsPage/ProjectsPageSkeleton";
import { FooterSection } from "@/screens/sections/FooterSection";
import { LayoutGroup, motion } from "framer-motion";
import { Layers, Search } from "lucide-react";
import { useMemo, useState } from "react";

export type { PublicProject as Project } from "@/data/projectUiMapper";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

export const ProjectsPage = (): JSX.Element => {
  const { projects, loading, error } = usePublishedProjects();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    const matches = projects.filter((p) => {
      const matchCat = filter === "All" || p.category === filter;
      const matchSearch =
        search === "" ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.technologies.some((t) =>
          t.toLowerCase().includes(search.toLowerCase()),
        );
      return matchCat && matchSearch;
    });

    return [...matches].sort((a, b) => {
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });
  }, [projects, filter, search]);

  const countForCategory = (cat: string) =>
    cat === "All"
      ? projects.length
      : projects.filter((p) => p.category === cat).length;

  if (loading && projects.length === 0) {
    return <ProjectsPageSkeleton />;
  }

  if (error && projects.length === 0) {
    return (
      <main id="main-content" className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
        <div className="relative z-[1] flex flex-col w-full">
          <Header />
          <div className="w-full flex-1 pt-40 pb-24 text-center text-red-400/80 text-sm px-4">
            Could not load projects. Check Supabase env and published items in
            the admin.
          </div>
          <FooterSection />
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <div className="relative z-[1] flex flex-col w-full">
        <Header />

        <section className="w-full pt-40 pb-16 relative overflow-hidden">
          <div
            className="pointer-events-none absolute -top-32 right-1/3 w-[500px] h-[400px]
          bg-gradient-to-b from-blue-600/8 via-violet-600/5 to-transparent rounded-full blur-3xl"
          />

          <div className="container mx-auto px-4">
            <motion.div initial="hidden" animate="visible" variants={fadeUp(0)}>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
              tracking-widest uppercase bg-white/5 border border-white/10 text-white/50 mb-4"
              >
                <Layers className="w-3.5 h-3.5" />
                Portfolio
              </span>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.05)}
              className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
            >
              My Projects
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.1)}
              className="text-lg text-white/50 max-w-xl mb-10"
            >
              A curated selection of work from full-stack applications to
              WordPress, Shopify, and WooCommerce builds.
            </motion.p>

            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeUp(0.15)}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilter(cat)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                    ${
                      filter === cat
                        ? "bg-white text-[#161616] shadow-lg shadow-white/10"
                        : "bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {cat}
                    <span
                      className={`ml-1.5 text-xs ${filter === cat ? "text-[#161616]/60" : "text-white/30"}`}
                    >
                      ({countForCategory(cat)})
                    </span>
                  </button>
                ))}
              </div>

              <div className="relative sm:ml-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  type="text"
                  placeholder="Search projects or tech…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-xl bg-white/5 border-white/10
                  text-sm text-white placeholder:text-white/30 focus-visible:border-white/20
                  focus-visible:bg-white/[0.07] transition-all duration-200"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {filteredProjects.length > 0 && (
          <section className="w-full pb-28">
            <div className="container mx-auto px-4">
              <LayoutGroup>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((p, i) => (
                    <ProjectCard key={p.id} project={p} index={i} />
                  ))}
                </div>
              </LayoutGroup>
            </div>
          </section>
        )}

        {projects.length === 0 && !loading && !error && (
          <section className="w-full pb-28">
            <div className="container mx-auto px-4 flex flex-col items-center py-20 gap-3 max-w-lg text-center">
              <Layers className="w-8 h-8 text-white/20" />
              <p className="text-white/50 text-sm leading-relaxed">
                No published projects yet. Open the admin, add projects, and set
                status to <span className="text-white/70">published</span>
                they will appear here automatically.
              </p>
            </div>
          </section>
        )}

        {projects.length > 0 && filteredProjects.length === 0 && (
          <section className="w-full pb-28">
            <div className="container mx-auto px-4 flex flex-col items-center py-20 gap-3">
              <Search className="w-8 h-8 text-white/20" />
              <p className="text-white/40 text-center">
                No projects match your search.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilter("All");
                  setSearch("");
                }}
                className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Clear filters
              </button>
            </div>
          </section>
        )}

        <FooterSection />
      </div>
    </main>
  );
};
