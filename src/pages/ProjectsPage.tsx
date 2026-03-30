import { PublicSeo } from "@/components/public/PublicSeo";
import type { PublicProject } from "@/data/projectUiMapper";
import { usePublishedProjects } from "@/hooks/usePublishedProjects";
import Header from "@/components/Header";
import { Input } from "@/components/ui/input";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion } from "framer-motion";
import { ArrowRight, ExternalLink, Github, Layers, Search, Star, Tag } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export type { PublicProject as Project };

const categoryBadge: Record<string, string> = {
  "Full Stack": "bg-violet-500/20 text-violet-300 border-violet-500/30",
  Frontend: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  CMS: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
};

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay, ease: [0.37, 0.04, 0.29, 1.01] },
  },
});

const featuredViewport = { once: true as const, amount: 0.08, margin: "120px 0px 80px 0px" };
const cardViewport = { once: true as const, amount: 0.08, margin: "80px 0px 80px 0px" };

const FeaturedCard = ({
  project,
  index,
}: {
  project: PublicProject;
  index: number;
}) => {
  const even = index % 2 === 0;

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={featuredViewport}
      variants={fadeUp(index * 0.1)}
    >
      <div
        className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl border border-white/[0.08]
        bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden
        hover:border-white/[0.14] transition-all duration-500"
      >
        <Link
          to={`/projects/${project.id}`}
          className={`relative overflow-hidden aspect-auto h-[480px] block ${even ? "lg:order-1" : "lg:order-2"}`}
        >
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent lg:block hidden" />
          <div
            className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent lg:hidden`}
          />
          {project.featured ? (
            <div
              className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold"
            >
              <Star className="w-3 h-3 fill-current" />
              Featured
            </div>
          ) : null}
        </Link>

        {/* Content */}
        <div
          className={`flex flex-col justify-center p-8 md:p-10 ${even ? "lg:order-2" : "lg:order-1"}`}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold border
              ${categoryBadge[project.category] ?? "bg-white/10 text-white/50 border-white/10"}`}
            >
              <Tag className="w-3 h-3" />
              {project.category}
            </span>
            {project.year && (
              <span className="text-xs text-white/30">{project.year}</span>
            )}
          </div>

          <Link to={`/projects/${project.id}`} className="group/title block">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight group-hover/title:text-violet-200/95 transition-colors">
              {project.title}
            </h3>
          </Link>
          <Link to={`/projects/${project.id}`} className="block mb-6">
            <p className="text-white/50 leading-relaxed line-clamp-4 hover:text-white/60 transition-colors">
              {project.longDescription || project.description}
            </p>
          </Link>

          {/* Stats */}
          {project.stats && project.stats.length > 0 && (
            <div className="flex gap-6 mb-6 pb-6 border-b border-white/[0.06]">
              {project.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-white/40">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tech */}
          <div className="flex flex-wrap gap-2 mb-6">
            {project.technologies.map((t) => (
              <span
                key={t}
                className="px-2.5 py-1 rounded-lg text-xs font-medium
                bg-white/5 border border-white/10 text-white/60"
              >
                {t}
              </span>
            ))}
          </div>

          {/* Links */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/projects/${project.id}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/15 border border-violet-500/30
                text-sm font-semibold text-violet-200 hover:bg-violet-500/25 transition-all duration-200"
            >
              View project
              <ArrowRight className="w-4 h-4" />
            </Link>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-[#161616]
                  text-sm font-semibold hover:bg-white/90 transition-colors duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                Live Demo
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10
                  text-sm font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Github className="w-4 h-4" />
                Source
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProjectCard = ({
  project,
  index,
}: {
  project: PublicProject;
  index: number;
}) => {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={cardViewport}
      variants={fadeUp(index * 0.08)}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      <div
        className="group relative flex flex-col rounded-2xl border border-white/[0.08] overflow-hidden
        bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/[0.14]
        transition-all duration-400 h-full"
      >
        <Link to={`/projects/${project.id}`} className="relative overflow-hidden aspect-video block">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border
              ${categoryBadge[project.category] ?? "bg-white/10 text-white/50 border-white/10"}`}
            >
              {project.category}
            </span>
          </div>

          {project.year && (
            <div className="absolute top-3 right-3 text-[11px] text-white/30 font-medium">
              {project.year}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <Link to={`/projects/${project.id}`} className="group/cardtitle block mb-2">
            <h3 className="text-base font-bold text-white group-hover/cardtitle:text-violet-200/90 transition-colors">
              {project.title}
            </h3>
          </Link>
          <Link to={`/projects/${project.id}`} className="block mb-4 flex-1 min-h-0">
            <p className="text-sm text-white/50 leading-relaxed line-clamp-2 hover:text-white/60 transition-colors">
              {project.description}
            </p>
          </Link>

          {/* Stats */}
          {project.stats && project.stats.length > 0 && (
            <div className="flex gap-4 mb-4 pb-4 border-b border-white/[0.06]">
              {project.stats.map((s) => (
                <div key={s.label}>
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[11px] text-white/30">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Tech pills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 3).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-md text-[11px]
                bg-white/5 border border-white/[0.07] text-white/50"
              >
                {t}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-0.5 rounded-md text-[11px] text-white/30">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>

          {/* Links */}
          <div className="flex gap-2 mt-auto">
            <Link
              to={`/projects/${project.id}`}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                bg-violet-500/15 border border-violet-500/25 text-xs font-semibold text-violet-200/95
                hover:bg-violet-500/25 transition-all duration-200"
            >
              Details
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-white/5 border border-white/10 text-xs font-semibold text-white/60
                  hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Live
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl
                  bg-white/5 border border-white/10 text-xs font-semibold text-white/60
                  hover:text-white hover:bg-white/10 transition-all duration-200"
              >
                <Github className="w-3.5 h-3.5" />
                Code
              </a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const ProjectsPage = (): JSX.Element => {
  const { projects, loading, error } = usePublishedProjects();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    const set = new Set(projects.map((p) => p.category).filter(Boolean));
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [projects]);

  const filteredProjects = projects.filter((p) => {
    const matchCat = filter === "All" || p.category === filter;
    const matchSearch =
      search === "" ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.technologies.some((t) =>
        t.toLowerCase().includes(search.toLowerCase()),
      );
    return matchCat && matchSearch;
  });

  const featuredProjects = filteredProjects.filter((p) => p.featured);
  const regularProjects = filteredProjects.filter((p) => !p.featured);

  const countForCategory = (cat: string) =>
    cat === "All" ? projects.length : projects.filter((p) => p.category === cat).length;

  if (loading && projects.length === 0) {
    return (
      <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
        <div className="relative z-[1] flex flex-col w-full">
          <PublicSeo />
          <Header />
          <section className="w-full flex-1 pt-40 pb-16 relative" aria-busy="true">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 animate-pulse space-y-6">
              <div className="h-7 w-28 rounded-full bg-white/10" />
              <div className="h-14 max-w-md rounded-lg bg-white/10" />
              <div className="h-5 max-w-xl rounded bg-white/[0.06]" />
              <div className="flex flex-wrap gap-2 pt-2">
                <div className="h-10 w-20 rounded-xl bg-white/10" />
                <div className="h-10 w-24 rounded-xl bg-white/10" />
                <div className="h-10 w-28 rounded-xl bg-white/10" />
              </div>
              <p className="text-white/40 text-sm pt-4">Loading projects…</p>
            </div>
          </section>
          <FooterSection />
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
        <div className="relative z-[1] flex flex-col w-full">
          <PublicSeo />
          <Header />
          <div className="w-full flex-1 pt-40 pb-24 text-center text-red-400/80 text-sm px-4">
            Could not load projects. Check Supabase env and published items in the admin.
          </div>
          <FooterSection />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <div className="relative z-[1] flex flex-col w-full">
      <PublicSeo />
      <Header />

      <section className="w-full pt-40 pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 right-1/3 w-[500px] h-[400px]
          bg-gradient-to-b from-blue-600/8 via-violet-600/5 to-transparent rounded-full blur-3xl"
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
            A curated selection of work — from full-stack applications to
            WordPress builds and everything in between.
          </motion.p>

          {/* Controls */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp(0.15)}
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Filters */}
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

            {/* Search */}
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

      {featuredProjects.length > 0 && (
        <section className="w-full pb-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-current" />
              <h2 className="text-xl font-bold text-white">Featured work</h2>
            </div>
            <div className="space-y-5">
              {featuredProjects.map((p, i) => (
                <FeaturedCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {regularProjects.length > 0 && (
        <section className="w-full pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {featuredProjects.length > 0 && (
              <h2 className="text-xl font-bold text-white mb-6">
                {filter === "All" ? "More projects" : `${filter} projects`}
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {regularProjects.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {projects.length === 0 && !loading && !error && (
        <section className="w-full pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center py-20 gap-3 max-w-lg text-center">
            <Layers className="w-8 h-8 text-white/20" />
            <p className="text-white/50 text-sm leading-relaxed">
              No published projects yet. Open the admin, add projects, and set status to{" "}
              <span className="text-white/70">published</span> — they will appear here automatically.
            </p>
          </div>
        </section>
      )}

      {projects.length > 0 && filteredProjects.length === 0 && (
        <section className="w-full pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center py-20 gap-3">
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
    </div>
  );
};
