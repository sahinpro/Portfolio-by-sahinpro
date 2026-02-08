import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
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
  const headerRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);

  const filteredProjects =
    filter === "All"
      ? projects
      : projects.filter((p) => p.category === filter);

  const featuredProjects = projects.filter((p) => p.featured);
  const regularProjects = filteredProjects.filter(
    (p) => !p.featured || filter !== "All"
  );

  useEffect(() => {
    // Header animation
    if (headerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Filters animation
    if (filtersRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                filtersRef.current,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(filtersRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Featured projects animation
    if (featuredRef.current && filter === "All") {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                featuredRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(featuredRef.current);
      return () => observer.disconnect();
    }
  }, [filter]);

  useEffect(() => {
    // Projects grid animation
    if (projectsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                projectsRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.8,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(projectsRef.current);
      return () => observer.disconnect();
    }
  }, [filter]);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div ref={headerRef} className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 text-white">
              My Projects
            </h1>
            <p className="text-white/70 max-w-xl mx-auto text-lg">
              A collection of my recent work showcasing my skills in web
              development, design, and problem-solving
            </p>
          </div>

          {/* Filter Buttons */}
          <div ref={filtersRef} className="flex flex-wrap justify-center gap-3 mb-12">
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
          </div>

          {/* Featured Projects */}
          {filter === "All" && featuredProjects.length > 0 && (
            <div ref={featuredRef} className="mb-16">
              <h2 className="text-2xl font-bold mb-6 text-white">
                Featured Projects
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {featuredProjects.map((project, index) => (
                  <ProjectCard key={project.id} project={project} index={index} featured />
                ))}
              </div>
            </div>
          )}

          {/* All Projects Grid */}
          <div ref={projectsRef}>
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
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};
