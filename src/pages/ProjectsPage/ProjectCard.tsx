import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { ExternalLink, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Project {
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

interface ProjectCardProps {
  project: Project;
  index: number;
  featured?: boolean;
}

export const ProjectCard = ({
  project,
  index,
  featured = false,
}: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              cardRef.current,
              { opacity: 0, y: 30 },
              {
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: index * 0.1,
                ease: "power3.out",
              }
            );
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;
    const handleMouseEnter = () => {
      gsap.to(card, { y: -5, duration: 0.3, ease: "power2.out" });
    };
    const handleMouseLeave = () => {
      gsap.to(card, { y: 0, duration: 0.3, ease: "power2.out" });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div ref={cardRef}>
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
    </div>
  );
};
