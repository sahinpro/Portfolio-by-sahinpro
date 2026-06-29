/**use for all public scroll entrances. */
export const scrollViewport = {
  once: true,
  amount: 0.25 as const,
  margin: "0px 0px -5% 0px" as const,
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
    transition: { duration: 0.3, ease: sectionEase },
  },
};

export const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay, ease: sectionEase },
  },
});

/** Home hero — mount sequence for above-the-fold copy and actions */
export const heroIntroStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.072,
      delayChildren: 0.1,
    },
  },
};

export const heroFadeStep = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: sectionEase },
  },
};

export const heroCtaStagger = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
};

export const heroTiming = {
  socialLinksDelay: 0.52,
  contactSocialDelay: 0.42,
  socialIconStagger: 0.045,
  /** After hero copy + CTAs; aligns with header settle (~0.5s) */
  codeEditorDelay: 0.58,
  /** Defer heavy editor bundle after the shell has faded in */
  codeEditorDeferMs: {
    desktop: 1800,
    mobile: 3800,
  },
  /** Pause before typing starts once the live editor mounts */
  codeEditorTypingDelay: 220,
} as const;

export const heroCodeEditorReveal = {
  hidden: { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.64,
      delay: heroTiming.codeEditorDelay,
      ease: sectionEase,
    },
  },
};

export const socialLinkStagger = (delay = 0) => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: heroTiming.socialIconStagger,
      delayChildren: delay,
    },
  },
});

export const socialLinkFade = {
  hidden: { opacity: 0, y: 14, scale: 0.94 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: sectionEase },
  },
};
