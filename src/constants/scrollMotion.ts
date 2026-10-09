/** Public scroll entrances — fire as soon as any pixel is on screen. */
export const scrollViewport = {
  once: true,
  amount: "some" as const,
  margin: "0px" as const,
} as const;

export const sectionEase = [0.37, 0.04, 0.29, 1.01] as const;

const heroEase = [0.22, 1, 0.36, 1] as const;

/** 40ms between sibling items — starts with the parent, no extra wait. */
export const itemStagger = 0.04;

/** Parent: orchestrates direct children in sequence */
export const sectionReveal = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: itemStagger,
      delayChildren: 0,
    },
  },
};

/**
 * Keep copy opaque in the SSR HTML. Google treats opacity:0 as hidden content
 * and Search Console can report "Page indexed without content".
 */
export const fadeInUp = {
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: sectionEase },
  },
};

export const fadeUp = (delay = 0) => ({
  hidden: { opacity: 1, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay, ease: sectionEase },
  },
});

/** Above-the-fold page heroes — play on mount, aligned with first paint. */
export const pageHeroReveal = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
};

export const pageHeroItem = fadeInUp;

/** Home hero — single parent orchestrates copy then editor */
export const heroContainer = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.08,
    },
  },
};

/** Left column: staggers name → heading → description → CTAs → social */
export const heroCopyColumn = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0,
      staggerChildren: 0.07,
    },
  },
};

export const heroItem = {
  hidden: {
    opacity: 1,
    y: 16,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: heroEase,
    },
  },
};

/** Editor: short fade, not gated on the copy sequence */
export const editorItem = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.35,
      delay: 0,
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
      staggerChildren: itemStagger,
      delayChildren: 0,
    },
  },
};

export const heroTiming = {
  socialLinksDelay: 0,
  contactSocialDelay: 0,
  socialIconStagger: itemStagger,
  codeEditorDelay: 0,
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
  hidden: { opacity: 1, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.32, ease: sectionEase },
  },
};
