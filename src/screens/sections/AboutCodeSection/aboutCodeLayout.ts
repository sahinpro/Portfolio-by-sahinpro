/** Fixed-height preview; clip overflow so the pane never steals page wheel scroll. */
export const aboutCodePaneClass =
  "about-code-pane w-full overflow-x-clip overflow-y-clip h-[470px]";

/** Lets vertical swipes reach the page on mobile instead of trapping in the pane. */
export const aboutCodePanePassScrollClass =
  "max-md:pointer-events-none max-md:select-none max-md:touch-pan-y";

/** Frosted chrome — HIGH/MEDIUM keep blur; LOW stripped via `html[data-perf=low]`. */
export const aboutCodeChromeClass =
  "about-code-chrome relative w-full rounded-[25px] lg:rounded-[28px] border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/30 to-white/50 p-2 lg:p-2.5";
