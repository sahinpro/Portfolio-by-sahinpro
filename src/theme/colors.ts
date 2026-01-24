/**
 * Global Color Theme System
 * 
 * This file contains all colors used throughout the application.
 * Update colors here to easily change the theme across the entire codebase.
 */

export const colors = {
  // Background Colors
  background: {
    primary: "#050505",
    secondary: "#070707",
    card: "#070707",
    cardWithOpacity: "#070707cc",
    dark: "#0d0d0d",
    darker: "#0f0f0f",
    darkest: "#141414",
    panel: "#1c1c1c",
    button: "#181818",
    buttonDark: "#161616",
    buttonText: "#1a1a1b",
    gray: "#252525",
    grayLight: "#2d2d2d",
    grayMedium: "#474747",
  },

  // Text Colors
  text: {
    primary: "rgb(255, 255, 255)",
    secondary: "rgba(255, 255, 255, 0.8)",
    muted: "rgba(255, 255, 255, 0.7)",
    mutedLight: "rgba(255, 255, 255, 0.6)",
    heading: "rgb(255, 255, 255)",
    menuActive: "rgb(255, 255, 255)",
    menuHover: "rgb(255, 255, 255)",
    normal: "rgba(255, 255, 255, 0.7)",
    gray: "#727272",
    grayLight: "#acb5bb",
    grayMedium: "#b3b3b3",
    grayLighter: "#b1b1b1",
    grayLightest: "#ebebeb",
    dark: "#161616",
    darkMedium: "#181818",
    darkLight: "#1a1a1b",
  },

  // Border Colors
  border: {
    primary: "rgba(255, 255, 255, 0.1)",
    secondary: "rgba(255, 255, 255, 0.2)",
    light: "rgba(255, 255, 255, 0.05)",
    medium: "rgba(255, 255, 255, 0.08)",
    dark: "rgba(255, 255, 255, 0.0d)",
    white10: "#ffffff1a",
    white05: "#ffffff0d",
    white08: "#ffffff08",
    white05Hex: "#ffffff05",
    white0a: "#ffffff0a",
    white0f: "#ffffff0f",
    white26: "#ffffff26",
    white1f: "#ffffff1f",
    gray: "#474747",
    gray80: "#47474780",
    gray33: "#47474733",
  },

  // Accent Colors
  accent: {
    cyan: "#06b6d4",
    cyanLight: "#22d3ee",
    yellow: "#ebac30",
    white: "#ffffff",
    gray: "#dbdbdb",
    grayLight: "#ababab",
    beige: "#fcf6eb",
  },

  // Shadow Colors
  shadow: {
    black40: "#00000040",
    black1f: "#0000001f",
    black0a: "#0000000a",
    black4c: "#0000004c",
    black0d: "#0000000d",
    blue1a: "#131d321a",
    gray0d: "#2525250d",
    purple1a: "#d8dbfe1a",
    white1a: "#ffffff1a",
    white26: "#ffffff26",
    white1c: "#ffffff1c",
    blue08: "#becaea08",
  },

  // Overlay/Blur Colors
  overlay: {
    white05: "rgba(255, 255, 255, 0.05)",
    white08: "rgba(255, 255, 255, 0.08)",
    white10: "rgba(255, 255, 255, 0.1)",
    white15: "rgba(255, 255, 255, 0.15)",
    white20: "rgba(255, 255, 255, 0.2)",
    white26: "rgba(255, 255, 255, 0.26)",
    white40: "rgba(255, 255, 255, 0.4)",
    white60: "rgba(255, 255, 255, 0.6)",
    white80: "rgba(255, 255, 255, 0.8)",
    white95: "rgba(255, 255, 255, 0.95)",
    black05: "rgba(0, 0, 0, 0.05)",
    black10: "rgba(0, 0, 0, 0.1)",
    black20: "rgba(0, 0, 0, 0.2)",
    black30: "rgba(0, 0, 0, 0.3)",
    black40: "rgba(0, 0, 0, 0.4)",
    black50: "rgba(0, 0, 0, 0.5)",
    gray80: "#d9d9d980",
    grayLight: "rgba(246, 247, 250, 0.2)",
  },

  // Gradient Colors (for reference - actual gradients defined separately)
  gradient: {
    whiteToTransparent: "rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 86%",
    whiteToTransparentFull: "rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%",
    whiteSubtle: "rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%",
    whiteMedium: "rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0) 100%",
    whiteStrong: "rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%",
    blackToTransparent: "rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.2) 100%",
    blackToTransparentHover: "rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 100%",
    darkGray: "rgba(31, 31, 31, 1) 0%, rgba(31, 31, 31, 1) 100%",
    darkGrayHover: "rgba(41, 41, 41, 1) 0%, rgba(41, 41, 41, 1) 100%",
    darkGrayBorder: "rgba(41, 41, 41, 1) 0%, rgba(71, 71, 71, 1) 100%",
  },
} as const;

/**
 * Helper function to get color value
 * Usage: getColor('text.primary') or getColor('background.card')
 */
export const getColor = (path: string): string => {
  const keys = path.split('.');
  let value: any = colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${path}" not found`);
      return '';
    }
  }
  
  return value;
};

/**
 * Export individual color categories for easier imports
 */
export const backgroundColors = colors.background;
export const textColors = colors.text;
export const borderColors = colors.border;
export const accentColors = colors.accent;
export const shadowColors = colors.shadow;
export const overlayColors = colors.overlay;
