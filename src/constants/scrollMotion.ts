/** Matches Contact page scroll triggers — use for all public scroll entrances. */
export const scrollViewport = {
  once: true,
  amount: 0.2 as const,
  margin: "0px 0px -10% 0px" as const,
} as const;

export const sectionEase = [0.37, 0.04, 0.29, 1.01] as const;

/** Parent: orchestrates direct children in sequence */
export const sectionReveal = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.085,
      delayChildren: 0.045,
    },
  },
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.52, ease: sectionEase },
  },
};
