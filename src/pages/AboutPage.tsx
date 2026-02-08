import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { Calendar, Code, Heart, Users } from "lucide-react";
import { useState } from "react";
import Header from "@/components/Header";
import { FooterSection } from "@/screens/sections/FooterSection/FooterSection";
import { CTAButton } from "@/components/CTAButton";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { icon: Calendar, value: "2+", label: "Years Experience" },
  { icon: Code, value: "200+", label: "Projects Completed" },
  { icon: Users, value: "100%", label: "Client Satisfaction" },
  { icon: Heart, value: "15+", label: "Technologies Mastered" },
];

const highlights = [
  {
    title: "WordPress Expert",
    description:
      "Custom plugin development and theme customization with 200+ successful projects",
    icon: "🎨",
  },
  {
    title: "Full Stack Developer",
    description:
      "Building modern web applications with React, Next.js, Express.js, and MongoDB",
    icon: "⚡",
  },
  {
    title: "Problem Solver",
    description: "Transforming complex requirements into elegant, scalable solutions",
    icon: "🚀",
  },
  {
    title: "Continuous Learner",
    description: "Always exploring new technologies and best practices to stay ahead",
    icon: "📚",
  },
];

/**
 * About page component - Personal information and professional highlights
 */
export const AboutPage = (): JSX.Element => {
  const [copied, setCopied] = useState(false);
  const email = "sahinhub@gmail.com";
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const statCardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const highlightCardsRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleResumeClick = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "Sahin_Alam_Resume.pdf";
    link.click();
  };

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
                  duration: 0.6,
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
    // Stats animation
    if (statsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                statsRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  delay: 0.2,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(statsRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Stat cards animation
    const cards = statCardsRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                cards,
                { opacity: 0, scale: 0.9 },
                {
                  opacity: 1,
                  scale: 1,
                  duration: 0.5,
                  stagger: 0.1,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Highlights animation
    if (highlightsRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                highlightsRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  delay: 0.3,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(highlightsRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Highlight cards animation
    const cards = highlightCardsRefs.current.filter(Boolean) as HTMLDivElement[];
    if (cards.length > 0) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                cards,
                { opacity: 0, y: 20 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.5,
                  stagger: 0.1,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      cards.forEach((card) => observer.observe(card));
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // CTA buttons animation
    if (ctaRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                ctaRef.current,
                { opacity: 0, y: 30 },
                {
                  opacity: 1,
                  y: 0,
                  duration: 0.6,
                  delay: 0.4,
                  ease: "power3.out",
                }
              );
            }
          });
        },
        { threshold: 0.1 }
      );
      observer.observe(ctaRef.current);
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => {
    // Hover animations for stat and highlight cards
    const allCards = [
      ...statCardsRefs.current,
      ...highlightCardsRefs.current,
    ].filter(Boolean) as HTMLDivElement[];
    allCards.forEach((card) => {
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
    });
  }, []);

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div ref={headerRef} className="mb-12">
            <div className="flex gap-2 items-center mb-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                About Me
              </h2>
            </div>
            <p className="max-w-3xl text-lg text-text-normal leading-relaxed">
              Since 2023, I've been working as a{" "}
              <span className="text-white font-semibold">
                Junior Web Developer
              </span>{" "}
              at{" "}
              <a
                href="https://wenextcoder.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline transition-all duration-300"
              >
                We Next Coder Agency
              </a>
              , where I've honed my skills in creating exceptional digital
              experiences. My journey began with WordPress development, and now
              I'm expanding into Full Stack Development.
            </p>
          </div>

          {/* Stats Section */}
          <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  ref={(el) => {
                    statCardsRefs.current[index] = el;
                  }}
                >
                  <Card className="glass-card glass-card-hover p-6 text-center group">
                    <CardContent className="p-0">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-[#141414] flex items-center justify-center group-hover:scale-110 transition-transform border-[0.81px] border-solid border-[#ffffff08]">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-4xl font-bold mb-2 text-white">
                        {stat.value}
                      </div>
                      <div className="text-text-normal text-sm">{stat.label}</div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>

          {/* Highlights Grid */}
          <div ref={highlightsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                ref={(el) => {
                  highlightCardsRefs.current[index] = el;
                }}
              >
                <Card className="glass-card glass-card-hover p-6">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-4">{highlight.icon}</div>
                    <h3 className="text-xl font-bold mb-2 text-white">
                      {highlight.title}
                    </h3>
                    <p className="text-text-normal text-sm leading-relaxed">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div ref={ctaRef} className="flex flex-wrap gap-4 justify-center">
            <CTAButton onClick={handleResumeClick} variant="primary">
              Download Resume
            </CTAButton>

            <CTAButton onClick={handleCopy} variant="secondary">
              {copied ? "Copied!" : "Copy Email"}
            </CTAButton>

            <CTAButton href="/contact" variant="primary">
              Schedule Call
            </CTAButton>
          </div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};
