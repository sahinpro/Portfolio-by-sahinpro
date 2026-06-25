import type { BentoCardProps } from "@/components/effects/MagicBento";
import MagicBento from "@/components/effects/MagicBento";
import { SectionHeader, SectionShell } from "@/components/sections";
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
      "Responsive interfaces and production-ready pages from design handoff — React, Next.js, and JavaScript.",
    image: "/bentocardImage/full-stack.webp",
  },
  {
    color: "#0d0d0d",
    title: "Backend & APIs",
    description:
      "End-to-end web application development from database design to deployment. Building scalable solutions with Node.js, Express, MongoDB, and more.",
    image: "/bentocardImage/api.webp",
  },
  {
    color: "#0d0d0d",
    title: "WordPress & CMS Development",
    description:
      "Professional WordPress and Shopify development    custom themes, store setup, plugins, and optimization for performance and SEO.",
    image: "/bentocardImage/wordpress.webp",
  },
  {
    color: "#0d0d0d",
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce implementation with WooCommerce, Shopify, and custom shopping experiences with payment integration.",
    image: "/bentocardImage/ecommerce.jpg",
  },
  {
    color: "#0d0d0d",
    title: "Performance & SEO",
    description:
      "Fast-loading, SEO-optimized websites that rank well in search engines and provide excellent user experience.",
    image: "/bentocardImage/seo.webp",
  },
  {
    color: "#0d0d0d",
    title: "Clean Code",
    description: "Well-structured, maintainable code following best practices.",
    image: "/bentocardImage/cleancode.webp",
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
            description="Modern web development capabilities    from frontend interfaces to CMS and e-commerce builds."
          />
        </motion.div>
        <motion.div variants={fadeInUp} className={sectionContentClass}>
          <MagicBento
            textAutoHide={true}
            enableStars={false}
            enableSpotlight={false}
            enableBorderGlow={false}
            enableLiquidBorder={true}
            glowColor="149, 0, 255"
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
