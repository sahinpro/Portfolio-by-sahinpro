import { CTAButton } from "@/components/CTAButton";
import Header from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { FooterSection } from "@/screens/sections/FooterSection";
import { motion, useInView } from "framer-motion";
import { Calendar, Code, Heart, Users } from "lucide-react";
import { useRef, useState } from "react";

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

  const headerInView = useInView(headerRef, { once: true, margin: "-10%" });
  const statsInView = useInView(statsRef, { once: true, margin: "-10%" });
  const highlightsInView = useInView(highlightsRef, { once: true, margin: "-10%" });
  const ctaInView = useInView(ctaRef, { once: true, margin: "-10%" });

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

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  const statsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, delay: 0.2, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  const statCardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5, 
        ease: [0.37, 0.04, 0.29, 1.01], // power3.out equivalent
        staggerChildren: 0.1
      }
    }
  };

  const statItemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1 
    }
  };

  const highlightsVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, delay: 0.3, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  const highlightCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        ease: [0.37, 0.04, 0.29, 1.01], // power3.out equivalent
        staggerChildren: 0.1
      }
    }
  };

  const highlightItemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0 
    }
  };

  const ctaVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, delay: 0.4, ease: [0.37, 0.04, 0.29, 1.01] } // power3.out equivalent
    }
  };

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            ref={headerRef}
            initial="hidden"
            animate={headerInView ? "visible" : "hidden"}
            variants={headerVariants}
            className="mb-12"
          >
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
          </motion.div>

          {/* Stats Section */}
          <motion.div 
            ref={statsRef}
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            variants={statsVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            <motion.div 
              variants={statCardVariants}
              initial="hidden"
              animate={statsInView ? "visible" : "hidden"}
            >
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    ref={(el) => {
                      statCardsRefs.current[index] = el;
                    }}
                    variants={statItemVariants}
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
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Highlights Grid */}
          <motion.div 
            ref={highlightsRef}
            initial="hidden"
            animate={highlightsInView ? "visible" : "hidden"}
            variants={highlightsVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            <motion.div 
              variants={highlightCardVariants}
              initial="hidden"
              animate={highlightsInView ? "visible" : "hidden"}
            >
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  ref={(el) => {
                    highlightCardsRefs.current[index] = el;
                  }}
                  variants={highlightItemVariants}
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
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            ref={ctaRef}
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={ctaVariants}
            className="flex flex-wrap gap-4 justify-center"
          >
            <CTAButton onClick={handleResumeClick} variant="primary">
              Download Resume
            </CTAButton>

            <CTAButton onClick={handleCopy} variant="secondary">
              {copied ? "Copied!" : "Copy Email"}
            </CTAButton>

            <CTAButton href="/contact" variant="primary">
              Schedule Call
            </CTAButton>
          </motion.div>
        </div>
      </section>
      <FooterSection />
    </div>
  );
};