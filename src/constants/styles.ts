/**
 * Design system constants and style utilities
 */

import { colors } from '@/theme/colors';

export const SCROLL_THRESHOLD = 50;
export const HEADER_ANIMATION_DURATION = 0.4;
export const MOBILE_BREAKPOINT = 640;

// Re-export colors from theme for backward compatibility
export const COLORS = {
  background: colors.background.primary,
  card: colors.background.card,
  border: colors.border.primary,
  borderHover: colors.border.secondary,
  // Global text colors
  text: {
    heading: colors.text.heading,
    menuActive: colors.text.menuActive,
    menuHover: colors.text.menuHover,
    normal: colors.text.normal,
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    muted: colors.text.muted,
  },
  // Global background colors
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
