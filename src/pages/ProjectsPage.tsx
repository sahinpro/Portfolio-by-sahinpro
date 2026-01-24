import { motion } from "framer-motion";
import { ExternalLink, Github, Code } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection/FooterSection";
import { CTAButton } from "@/components/CTAButton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  category: string;
  liveUrl: string | null;
  githubUrl: string | null;
  featured: boolean;
}

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

interface ProjectCardProps {
  project: Project;
  index: number;
  featured?: boolean;
}

const ProjectCard = ({
  project,
  index,
  featured = false,
}: ProjectCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
    >
      <Card className="glass-card glass-card-hover overflow-hidden">
        <CardContent className="p-0">
          {/* Project Image */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            />
            {project.featured && (
              <div className="absolute top-4 right-4 bg-white text-[#181818] px-3 py-1 rounded-full text-xs font-semibold">
                Featured
              </div>
            )}
          </div>

          {/* Project Content */}
          <div className="p-6">
            <div className="mb-2">
              <span className="text-xs text-cyan-400 font-semibold">
                {project.category}
              </span>
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">
              {project.title}
            </h3>
            <p className="text-white/70 text-sm mb-4 line-clamp-3">
              {project.description}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-4">
              {project.technologies.slice(0, 4).map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 text-xs bg-cyan-400/10 text-cyan-400 rounded-md border border-cyan-400/20"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {project.liveUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 glass-card border-[0.81px] border-solid border-[#ffffff1a] hover:border-[#ffffff26] text-white"
                >
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Live
                  </a>
                </Button>
              )}
              {project.githubUrl && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 glass-card border-[0.81px] border-solid border-[#ffffff1a] hover:border-[#ffffff26] text-white"
                >
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    Code
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
