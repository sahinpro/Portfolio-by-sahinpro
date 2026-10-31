export const BUTTON_VARIANTS = {
  primary: {
    base: "gap-2 px-3.5 py-2.5 rounded-lg overflow-hidden border border-[#ffffff1a]",
    background:
      "bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.2)_100%),linear-gradient(0deg,rgba(255,255,255,1)_0%,rgba(255,255,255,1)_100%)]",
    hover:
      "hover:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.3)_100%),linear-gradient(0deg,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.95)_100%)]",
    text: "text-[#161616] [font-family:'Inter_Display-Medium',Helvetica] font-medium text-sm tracking-[0] leading-5",
    shadow: "shadow hover:shadow-lg",
  },
  secondary: {
    base: "relative gap-2 px-4 py-2.5 rounded-lg border border-[#ffffff1a]",
    background:
      "shadow-[0px_1px_2px_#2525250d,inset_0px_-4px_14px_#00000040] [background:radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.1)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(31,31,31,1)_0%,rgba(31,31,31,1)_100%)]",
    hover:
      "hover:[background:radial-gradient(50%_50%_at_50%_0%,rgba(255,255,255,0.15)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,rgba(41,41,41,1)_0%,rgba(41,41,41,1)_100%)]",
    text: "",
    shadow: "",
  },
  outline: {
    base: "bg-transparent text-white border-[0.81px] border-solid border-[#ffffff1a]",
    background: "",
    hover: "hover:bg-white/5 hover:border-[#ffffff26]",
    text: "",
    shadow: "",
  },
} as const;
