import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import { ExternalLink, Github, Layers, Search, Star, Tag } from "lucide-react";
import { useRef, useState } from "react";

export interface Project {
  id: number;
  title: string;
  description: string;
  longDescription?: string;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
  year?: string;
  stats?: { label: string; value: string }[];
}

const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description:
      "Full-stack e-commerce solution with payment integration and admin dashboard",
    longDescription:
      "A complete end-to-end shopping experience with real-time inventory, Stripe payments, and a custom admin dashboard built with React and Node.js.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=90&fm=png",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "Full Stack",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    year: "2024",
    stats: [
      { label: "Revenue processed", value: "$50K+" },
      { label: "Monthly users", value: "2K+" },
    ],
  },
  {
    id: 2,
    title: "Portfolio Website",
    description:
      "Modern portfolio website with animations and responsive design",
    longDescription:
      "A high-performance portfolio with framer-motion animations, WebGL light effects, and a perfect Lighthouse score.",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=90",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "Frontend",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
    year: "2024",
    stats: [
      { label: "Lighthouse score", value: "100" },
      { label: "Load time", value: "< 1s" },
    ],
  },
  {
    id: 3,
    title: "WordPress Theme",
    description: "Custom WordPress theme with advanced customization options",
    longDescription:
      "A performance-first WordPress theme with custom Gutenberg blocks, WooCommerce support, and live customizer preview.",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=90",
    technologies: ["WordPress", "PHP", "JavaScript", "WooCommerce"],
    category: "CMS",
    liveUrl: null,
    githubUrl: "https://github.com",
    featured: false,
    year: "2023",
    stats: [{ label: "Sites using it", value: "40+" }],
  },
  {
    id: 4,
    title: "SaaS Dashboard",
    description: "Analytics dashboard with real-time data visualization",
    longDescription:
      "A modern analytics dashboard with WebSocket real-time updates, complex D3.js charts, and role-based access control.",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    technologies: ["React", "D3.js", "Express", "PostgreSQL"],
    category: "Full Stack",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: false,
    year: "2024",
    stats: [{ label: "Data points", value: "1M+" }],
  },
  {
    id: 5,
    title: "Agency Landing Page",
    description: "High-converting landing page for a digital marketing agency",
    longDescription:
      "Conversion-optimised landing page with A/B-tested hero sections, scroll-triggered animations, and integrated CRM forms.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&q=90",
    technologies: ["Next.js", "Tailwind CSS", "Framer Motion"],
    category: "Frontend",
    liveUrl: "https://example.com",
    githubUrl: null,
    featured: false,
    year: "2023",
    stats: [{ label: "Conversion rate", value: "8.4%" }],
  },
  {
    id: 6,
    title: "WooCommerce Plugin",
    description: "Custom WooCommerce plugin for advanced product bundling",
    longDescription:
      "A WordPress plugin that extends WooCommerce with product bundling, dynamic pricing rules, and upsell logic.",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=90",
    technologies: ["PHP", "WordPress", "WooCommerce", "React"],
    category: "CMS",
    liveUrl: null,
    githubUrl: "https://github.com",
    featured: false,
    year: "2023",
    stats: [{ label: "Active installs", value: "300+" }],
  },
];

const categories = ["All", "Full Stack", "Frontend", "CMS"];

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

const FeaturedCard = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true, margin: "-10%" });
  const even = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inV ? "visible" : "hidden"}
      variants={fadeUp(index * 0.1)}
    >
      <div
        className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl border border-white/[0.08]
        bg-gradient-to-br from-white/[0.03] to-transparent overflow-hidden
        hover:border-white/[0.14] transition-all duration-500"
      >
        <div
          className={`relative overflow-hidden aspect-auto h-[480px] ${even ? "lg:order-1" : "lg:order-2"}`}
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
          {/* Featured badge */}
          <div
            className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1 rounded-full
            bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-semibold"
          >
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        </div>

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

          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">
            {project.title}
          </h3>
          <p className="text-white/50 leading-relaxed mb-6">
            {project.longDescription || project.description}
          </p>

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
          <div className="flex gap-3">
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
  project: Project;
  index: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const inV = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inV ? "visible" : "hidden"}
      variants={fadeUp(index * 0.08)}
      whileHover={{ y: -6, transition: { duration: 0.3 } }}
    >
      <div
        className="group relative flex flex-col rounded-2xl border border-white/[0.08] overflow-hidden
        bg-gradient-to-b from-white/[0.03] to-transparent hover:border-white/[0.14]
        transition-all duration-400 h-full"
      >
        <div className="relative overflow-hidden aspect-video">
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
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-base font-bold text-white mb-2">
            {project.title}
          </h3>
          <p className="text-sm text-white/50 leading-relaxed mb-4 line-clamp-2 flex-1">
            {project.description}
          </p>

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
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const headerRef = useRef<HTMLDivElement>(null);
  const headerInV = useInView(headerRef, { once: true, margin: "-10%" });

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

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />

      <section className="w-full pt-40 pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute -top-32 right-1/3 w-[500px] h-[400px]
          bg-gradient-to-b from-blue-600/8 via-violet-600/5 to-transparent rounded-full blur-3xl"
        />

        <div ref={headerRef} className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0)}
          >
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
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.05)}
            className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4"
          >
            My Projects
          </motion.h1>

          <motion.p
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
            variants={fadeUp(0.1)}
            className="text-lg text-white/50 max-w-xl mb-10"
          >
            A curated selection of work — from full-stack applications to
            WordPress builds and everything in between.
          </motion.p>

          {/* Controls */}
          <motion.div
            initial="hidden"
            animate={headerInV ? "visible" : "hidden"}
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
                    (
                    {cat === "All"
                      ? projects.length
                      : projects.filter((p) => p.category === cat).length}
                    )
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search projects or tech…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10
                  text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/20
                  focus:bg-white/[0.07] transition-all duration-200"
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

      {filteredProjects.length === 0 && (
        <section className="w-full pb-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center py-20 gap-3">
            <Search className="w-8 h-8 text-white/20" />
            <p className="text-white/40 text-center">
              No projects match your search.
            </p>
            <button
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
  );
};
