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

const heroEase = [0.22, 1, 0.36, 1] as const;

/** Home hero — single parent orchestrates copy then editor */
export const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.18,
    },
  },
};

/** Left column: staggers name → heading → description → CTAs → social */
export const heroCopyColumn = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.15,
      staggerChildren: 0.18,
    },
  },
};

export const heroItem = {
  hidden: {
    opacity: 0,
    y: 24,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: heroEase,
    },
  },
};

/** Editor last: fade in after the hero copy sequence */
export const editorItem = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.9,
      delay: 0.15 + 5 * 0.18 + 0.12,
      ease: heroEase,
    },
  },
};

export const heroIntroStagger = heroContainer;

/** Shared fade step (about page + nested CTA buttons) */
export const heroFadeStep = heroItem;

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
  socialLinksDelay: 0.92,
  contactSocialDelay: 0.42,
  socialIconStagger: 0.055,
  codeEditorDelay: 0.15 + 5 * 0.18 + 0.12,
} as const;

export const heroCodeEditorReveal = editorItem;

export const heroSocialLinksGate = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: heroTiming.socialIconStagger,
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
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: sectionEase },
  },
};
