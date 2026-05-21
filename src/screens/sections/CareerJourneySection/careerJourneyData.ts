import type { LucideIcon } from "lucide-react";
import { BookOpen, Briefcase, Rocket } from "lucide-react";

export type TimelineEntry = {
  year: string;
  role: string;
  company: string;
  desc: string;
  icon: LucideIcon;
};

export const careerTimeline: TimelineEntry[] = [
  {
    year: "2023",
    role: "Junior Web Developer",
    company: "We Next Coder Agency",
    desc: "Joined the agency and started honing skills in WordPress and modern web technologies.",
    icon: Briefcase,
  },
  {
    year: "2022",
    role: "Freelance Developer",
    company: "Self-Employed",
    desc: "Began freelancing, building custom WordPress sites and React projects for clients worldwide.",
    icon: Rocket,
  },
  {
    year: "2021",
    role: "Started Learning",
    company: "Self-Taught",
    desc: "Began the coding journey with HTML/CSS, JavaScript, and WordPress development.",
    icon: BookOpen,
  },
];
