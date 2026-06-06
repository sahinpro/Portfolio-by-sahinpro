import type { BentoCardProps } from "@/components/MagicBento";
import MagicBento from "@/components/MagicBento";
import { SectionHeader, SectionShell } from "@/components/section";
import {
  sectionContentClass,
  sectionHeaderWrapClass,
  sectionMotionClass,
} from "@/constants/layout";
import {
  fadeInUp,
  scrollViewport,
  sectionReveal,
} from "@/constants/scrollMotion";
import { motion } from "framer-motion";

const skillsCards: BentoCardProps[] = [
  {
    color: "#0d0d0d",
    title: "Full Stack Development",
    description:
      "Responsive interfaces and production-ready pages from design handoff — React, Next.js, and TypeScript.",
    image:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=75&fm=webp",
  },
  {
    color: "#0d0d0d",
    title: "Backend & APIs",
    description:
      "End-to-end web application development from database design to deployment. Building scalable solutions with Node.js, Express, MongoDB, and more.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=75&fm=webp",
  },
  {
    color: "#0d0d0d",
    title: "WordPress & CMS Development",
    description:
      "Professional WordPress and Shopify development — custom themes, store setup, plugins, and optimization for performance and SEO.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=75&fm=webp",
  },
  {
    color: "#0d0d0d",
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences with payment integration.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=75&fm=webp",
  },
  {
    color: "#0d0d0d",
    title: "Performance & SEO",
    description:
      "Fast-loading, SEO-optimized websites that rank well in search engines and provide excellent user experience.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=75&fm=webp",
  },
  {
    color: "#0d0d0d",
    title: "Clean Code",
    description: "Well-structured, maintainable code following best practices.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=75&fm=webp",
  },
];

export const SkillsSection = (): JSX.Element => {
  return (
    <SectionShell id="expertise">
      <motion.div
        className={sectionMotionClass}
        initial="hidden"
        whileInView="visible"
        viewport={scrollViewport}
        variants={sectionReveal}
      >
        <motion.div variants={fadeInUp} className={sectionHeaderWrapClass}>
          <SectionHeader
            title="Skills & technologies"
            description="Modern web development capabilities — from frontend interfaces to CMS and e-commerce builds."
          />
        </motion.div>
        <motion.div variants={fadeInUp} className={sectionContentClass}>
          <MagicBento
            textAutoHide={true}
            enableStars={false}
            enableSpotlight={false}
            enableBorderGlow={false}
            enableTilt={false}
            enableMagnetism={false}
            clickEffect={false}
            spotlightRadius={200}
            particleCount={0}
            disableAnimations={true}
            cards={skillsCards}
          />
        </motion.div>
      </motion.div>
    </SectionShell>
  );
};
