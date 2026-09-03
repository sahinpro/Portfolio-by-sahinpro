import { colors } from '@/theme/colors';

export const SCROLL_THRESHOLD = 50;
export const HEADER_ANIMATION_DURATION = 0.55;
export const MOBILE_BREAKPOINT = 640;
/** Layout breakpoint for deferring heavy visuals (bento, chroma grid). */
export const MOBILE_LAYOUT_BREAKPOINT = 768;
/** Tailwind `lg` — WebGL aurora + hero code panel; disabled below this width. */
export const DESKTOP_LAYOUT_BREAKPOINT = 1024;

export const COLORS = {
  background: colors.background.primary,
  card: colors.background.card,
  border: colors.border.primary,
  borderHover: colors.border.secondary,
  text: {
    heading: colors.text.heading,
    menuActive: colors.text.menuActive,
    menuHover: colors.text.menuHover,
    normal: colors.text.normal,
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
  },
  bg: {
    transparent: colors.overlay.black10,
  },
  accent: {
    cyan: colors.accent.cyan,
    cyanLight: colors.accent.cyanLight,
  },
} as const;

export const ANIMATIONS = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.4,
  },
  easing: {
    easeInOut: "easeInOut",
    easeOut: "easeOut",
  },
} as const;

export const SPACING = {
  headerPadding: {
    mobile: "1rem",
    desktop: "1.5rem",
  },
  containerPadding: {
    mobile: "1rem",
    tablet: "1.5rem",
    desktop: "2rem",
  },
} as const;
