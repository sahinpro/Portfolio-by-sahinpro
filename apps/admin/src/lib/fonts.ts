import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "../../public/fonts/inter-latin-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-latin-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/inter-latin-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
  preload: true,
});

/** Hero display font — preloaded for LCP heading. */
export const monteCarlo = localFont({
  src: "../../public/fonts/montecarlo-latin-400.woff2",
  variable: "--font-monte-carlo",
  display: "swap",
  preload: true,
});
