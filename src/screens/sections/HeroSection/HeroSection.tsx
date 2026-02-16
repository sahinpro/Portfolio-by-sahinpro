import LightRays from "@/components/LightRays";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { FaBehance, FaDribbble, FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { HeroContent } from "./HeroContent";

const socialLinks = [
  { href: "https://github.com/sahinhub", icon: FaGithub, label: "GitHub" },
  { href: "https://linkedin.com/in/sahinhub", icon: FaLinkedin, label: "LinkedIn" },
  { href: "https://x.com/sahinhub", icon: FaTwitter, label: "X (Twitter)" },
  { href: "https://behance.net/sahinhub", icon: FaBehance, label: "Behance" },
  { href: "https://dribbble.com/sahinhub", icon: FaDribbble, label: "Dribbble" },
];

// Main Hero Section Component
export const HeroSection = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const socialLinksRef = useRef<(HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    // Main container animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power3.out",
        }
      );
    }

    // Content animation
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.2,
          ease: "power3.out",
        }
      );
    }

    // Social icons animation
    if (socialRef.current) {
      gsap.fromTo(
        socialRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          delay: 0.6,
        }
      );

      const links = socialLinksRef.current.filter(Boolean) as HTMLAnchorElement[];
      gsap.fromTo(
        links,
        { opacity: 0, scale: 0.6, y: 10 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.5,
          delay: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        }
      );

      // Hover animations
      links.forEach((link) => {
        link.addEventListener("mouseenter", () => {
          gsap.to(link, {
            scale: 1.15,
            y: -5,
            duration: 0.2,
            ease: "power2.out",
          });
        });
        link.addEventListener("mouseleave", () => {
          gsap.to(link, {
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "power2.out",
          });
        });
        link.addEventListener("mousedown", () => {
          gsap.to(link, {
            scale: 0.95,
            duration: 0.1,
          });
        });
        link.addEventListener("mouseup", () => {
          gsap.to(link, {
            scale: 1.15,
            duration: 0.1,
          });
        });
      });
    }

    // Badge animation
    if (badgeRef.current) {
      gsap.fromTo(
        badgeRef.current,
        { opacity: 0, y: -20, scale: 0.9 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          delay: 0.1,
          ease: "power3.out",
        }
      );
    }
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-12 min-h-screen flex items-center justify-center">
      {/* Light Rays Background Effect */}
      <div className="absolute inset-0 w-full h-full z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#d400ff"
          raysSpeed={1}
          lightSpread={3.4}
          rayLength={3}
          pulsating={false}
          fadeDistance={0.5}
          saturation={1}
          followMouse
          mouseInfluence={0.1}
          noiseAmount={0}
          distortion={0}
        />
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="pointer-events-none absolute left-0 bottom-0 w-full h-[200px] bg-gradient-to-t from-[#050505] via-[#05050580] to-transparent z-[1]" />
      
      {/* Lanyard 3D Component at Top */}
      <div
        ref={badgeRef}
        className="absolute top-0 left-0 w-full h-[400px] sm:h-[500px] z-[3] pointer-events-auto"
      >      </div>
      
      {/* Hero Content */}
      <div
        ref={containerRef}
        className="relative flex flex-col items-center justify-center py-8 z-[2] w-full"
      >
        <div ref={contentRef}>
          <HeroContent />
        </div>
        
        {/* Social Media Icons */}
        <div ref={socialRef} className="flex items-center gap-6 mt-8">
          {socialLinks.map((link, index) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                ref={(el) => {
                  socialLinksRef.current[index] = el;
                }}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-white transition-colors duration-300"
                aria-label={link.label}
              >
                {/* @ts-expect-error - react-icons type issue with strict mode */}
                {<Icon size={24} /> as any}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
};