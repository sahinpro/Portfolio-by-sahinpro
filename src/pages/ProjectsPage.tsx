import { motion } from "framer-motion";
import { useState } from "react";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection/FooterSection";
import { ProjectCard, Project } from "./ProjectsPage/ProjectCard";

const projects: Project[] = [
  {
    id: 1,
    title: "E-Commerce Platform",
    description: "Full-stack e-commerce solution with payment integration and admin dashboard",
    image: "/main-visual.png",
    technologies: ["React", "Node.js", "MongoDB", "Stripe"],
    category: "Full Stack",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
  },
  {
    id: 2,
    title: "Portfolio Website",
    description: "Modern portfolio website with animations and responsive design",
    image: "/main-visual-1.png",
    technologies: ["Next.js", "TypeScript", "Tailwind CSS"],
    category: "Frontend",
    liveUrl: "https://example.com",
    githubUrl: "https://github.com",
    featured: true,
  },
  {
    id: 3,
    title: "WordPress Theme",
    description: "Custom WordPress theme with advanced customization options",
    image: "/main-visual-2.png",
    technologies: ["WordPress", "PHP", "JavaScript"],
    category: "CMS",
    liveUrl: null,
    githubUrl: "https://github.com",
    featured: false,
  },
];

const categories = ["All", "Full Stack", "Frontend", "CMS"];

export const ProjectsPage = (): JSX.Element => {
  const [filter, setFilter] = useState<string>("All");

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.category === filter);

  const featuredProjects = projects.filter((p) => p.featured);
  const regularProjects = filteredProjects.filter(
    (p) => !p.featured || filter !== "All"
  );

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              My Projects
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-lg">
              A collection of my recent work showcasing my skills in web
              development, design, and problem-solving
            </p>
          </motion.div>

          {/* Filter Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === category
                    ? "bg-white text-[#181818] border-[0.81px] border-solid border-[#ffffff26] shadow-[inset_0px_6px_15.01px_#ffffff1c]"
                    : "glass-card text-white/80 hover:text-white border-[0.81px] border-solid border-[#ffffff1a]"
                }`}
              >
                {category}
              </button>
            ))}
          </motion.div>

          {/* Featured Projects */}
          {filter === "All" && featuredProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h2 className="text-2xl font-bold mb-6 text-white">
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} featured />
                ))}
              </div>
            </motion.div>
          )}

          {/* All Projects Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {filter !== "All" && (
              <h2 className="text-2xl font-bold mb-6 text-white">
                {filter} Projects
              </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};
