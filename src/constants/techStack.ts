/** Tech stack groups — aligned with GitHub README (no TypeScript; JS is the core language). */

export type TechStackItem = {
  name: string;
  /** `react-icons/si` Simple Icons export name */
  icon: string;
  /** Tailwind text color for the icon */
  color: string;
};

export type TechStackGroup = {
  title: string;
  items: readonly TechStackItem[];
};

export const TECH_STACK_GROUPS: readonly TechStackGroup[] = [
  {
    title: "Frontend",
    items: [
      { name: "HTML", icon: "SiHtml5", color: "#E34F26" },
      { name: "CSS", icon: "SiCss3", color: "#1572B6" },
      { name: "Tailwind CSS", icon: "SiTailwindcss", color: "#38BDF8" },
      { name: "shadcn/ui", icon: "SiShadcnui", color: "#FFFFFF" },
      { name: "JavaScript", icon: "SiJavascript", color: "#F7DF1E" },
      { name: "React 18/19", icon: "SiReact", color: "#61DAFB" },
      { name: "Next.js", icon: "SiNextdotjs", color: "#FFFFFF" },
      { name: "Vite", icon: "SiVite", color: "#646CFF" },
    ],
  },
  {
    title: "Backend & CMS",
    items: [
      { name: "Node.js", icon: "SiNodedotjs", color: "#339933" },
      { name: "Express", icon: "SiExpress", color: "#FFFFFF" },
      { name: "WordPress", icon: "SiWordpress", color: "#21759B" },
      { name: "WooCommerce", icon: "SiWoo", color: "#96588A" },
      { name: "MongoDB Atlas", icon: "SiMongodb", color: "#47A248" },
      { name: "Supabase", icon: "SiSupabase", color: "#3ECF8E" },
    ],
  },
  {
    title: "Tooling & Workflow",
    items: [
      { name: "Git", icon: "SiGit", color: "#F05032" },
      { name: "Figma", icon: "SiFigma", color: "#F24E1E" },
    ],
  },
] as const;

export const TECH_STACK_DESCRIPTION =
  "Languages, frameworks, and platforms behind the work. All projects are built with clean code and best practices.";
