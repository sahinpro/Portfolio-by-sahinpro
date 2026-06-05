import { PROFILE } from "@/constants/profile";
import { motion } from "framer-motion";

const subtitleGradient = {
  backgroundImage:
    "linear-gradient(169deg,rgba(120, 156, 255, 1) 0%, rgba(149, 0, 255, 1) 35%, rgba(195, 122, 255, 1) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
} as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.45,
      staggerChildren: 0.2,
    },
  },
};

const lineVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.37, 0.04, 0.29, 1.01],
    },
  },
};

const taglineVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay: 0.35,
      ease: [0.37, 0.04, 0.29, 1.01],
    },
  },
};

export const HeroSubtitle = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex w-full flex-col items-center gap-2 text-center lg:items-start lg:gap-2.5 lg:text-left"
      aria-label={[PROFILE.role, PROFILE.tagline].join(". ")}
    >
      {PROFILE.heroSubtitleLines.map((text) => (
        <motion.span
          key={text}
          variants={lineVariants}
          className="section-hero-subtitle block font-bold leading-[2rem] tracking-[-0.2px] text-3xl lg:text-[42px]"
          style={subtitleGradient}
        >
          {text}
        </motion.span>
      ))}
      <motion.p
        variants={taglineVariants}
        className="block max-w-xl text-xl font-medium leading-snug tracking-[-0.15px] text-white/55 sm:text-2xl lg:text-[28px] mt-1"
      >
        {PROFILE.tagline}
      </motion.p>
    </motion.div>
  );
};
