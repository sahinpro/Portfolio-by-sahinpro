import type { BentoCardProps } from "@/components/MagicBento";
import MagicBento from "@/components/MagicBento";
import { fadeInUp, scrollViewport, sectionReveal } from "@/constants/scrollMotion";
import Glow from "@/components/ui/glow";
import { motion } from "framer-motion";

const skillsCards: BentoCardProps[] = [
  {
    color: "#0d0d0d",
    title: "Frontend Development",
    description:
      "Expert in crafting beautiful, responsive user interfaces with modern technologies. Specialized in React, Next.js, Tailwind CSS, and creating amazing user experiences.",
    label: "Frontend",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&q=90&fm=png",
  },
  {
    color: "#0d0d0d",
    title: "Full Stack Solutions",
    description:
      "End-to-end web application development from database design to frontend implementation. Building scalable solutions with Node.js, Express, MongoDB, and more.",
    label: "Full Stack",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=90&fm=png",
  },
  {
    color: "#0d0d0d",
    title: "WordPress & CMS Development",
    description:
      "Professional WordPress website development with custom themes, plugins, and optimization for performance and SEO.",
    label: "CMS",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=90&fm=png",
  },
  {
    color: "#0d0d0d",
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences with payment integration.",
    label: "E-Commerce",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200&q=90&fm=png",
  },
  {
    color: "#0d0d0d",
    title: "Performance & SEO",
    description:
      "Fast-loading, SEO-optimized websites that rank well in search engines and provide excellent user experience.",
    label: "SEO",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=90&fm=png",
  },
  {
    color: "#0d0d0d",
    title: "Clean Code",
    description: "Well-structured, maintainable code following best practices.",
    label: "Quality",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=90&fm=png",
  },
];

export const SkillsSection = (): JSX.Element => {
  return (
    <section
      id="services"
      className="flex flex-col w-full max-w-[1440px] mx-auto items-center gap-12 px-4 sm:px-8 md:px-12 lg:px-[100px] py-12 sm:py-16 md:py-20 lg:py-[100px] relative"
    >
      <Glow variant="top" className="-z-20 blur-xl" />
      <motion.div
        className="flex flex-col w-full max-w-[1240px] items-center gap-12"
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div
          variants={fadeInUp}
          className="flex flex-col items-center gap-4 py-0 w-full"
        >
          <h2 className="flex items-center justify-center self-stretch mt-[-1.00px] section-heading-gradient [font-family:'Inter_Display-Medium',Helvetica] font-medium text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-center tracking-[-1.00px] leading-tight sm:leading-[40px] md:leading-[48px] lg:leading-[50px]">
            Skills & Technologies
          </h2>
          <p className="flex items-center justify-center w-full [font-family:'Inter_Display-Regular',Helvetica] font-normal text-[#b3b3b3] text-base sm:text-lg md:text-xl text-center tracking-[-0.20px] leading-6 sm:leading-7 md:leading-[32.0px]">
            Expertise in modern web development technologies and best practices
            for building scalable solutions.
          </p>
        </motion.div>
        <motion.div variants={fadeInUp} className="flex flex-col w-full items-center">
        <MagicBento
          textAutoHide={true}
          enableStars
          enableSpotlight
          enableBorderGlow={true}
          enableTilt={false}
          enableMagnetism={false}
          clickEffect
          spotlightRadius={200}
          particleCount={12}
          glowColor="0, 0, 255"
          disableAnimations={false}
          cards={skillsCards}
        />
        </motion.div>
      </motion.div>
    </section>
  );
};
