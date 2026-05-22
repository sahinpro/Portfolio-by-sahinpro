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
  hidden: {
    opacity: 0,
    y: 18,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.7,
      ease: [0.37, 0.04, 0.29, 1.01],
    },
  },
};

const lines = PROFILE.heroSubtitleLines.map((text, index) => ({
  text,
  isTagline: index === PROFILE.heroSubtitleLines.length - 1,
}));

export const HeroSubtitle = () => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex w-full flex-col items-center gap-1 text-center lg:items-start lg:gap-1.5 lg:text-left"
      aria-label={[PROFILE.role, PROFILE.tagline].join(". ")}
    >
      {lines.map(({ text, isTagline }) => (
        <motion.span
          key={text}
          variants={lineVariants}
          className={
            isTagline
              ? "block max-w-xl text-xl font-medium leading-snug tracking-[-0.15px] text-white/55 sm:text-2xl lg:text-[30px]"
              : "section-hero-subtitle block font-bold leading-[2rem] tracking-[-0.2px] text-3xl lg:text-[42px]"
          }
          style={isTagline ? undefined : subtitleGradient}
        >
          {text}
        </motion.span>
      ))}
    </motion.div>
  );
};
