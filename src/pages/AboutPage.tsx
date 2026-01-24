import { motion } from "framer-motion";
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

  return (
    <div className="flex flex-col items-start relative bg-[#050505] w-full min-h-screen shading-effect">
      <Header />
      <section className="py-32 relative w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
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

          {/* Highlights Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          >
            {highlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
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

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
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
