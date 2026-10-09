import { PROFILE } from "@/constants/profile";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Handshake } from "lucide-react";

export type TimelineEntry = {
  year: string;
  role: string;
  company: string;
  desc: string;
  icon: LucideIcon;
};

export const JOURNEY_DESCRIPTION = PROFILE.journeyDescription;

export const careerTimeline: TimelineEntry[] = [
  {
    year: "Mar 2023–Present",
    role: "Full Stack Web Developer",
    company: "We Next Coder",
    desc: "Built and delivered 200+ production client sites with WordPress and WooCommerce, with recent projects developed in React and Next.js, including the Paydios payment platform frontend; improved page-load speed 40%+ via Core Web Vitals optimisation.",
    icon: Briefcase,
  },
  {
    year: "Feb 2023–May 2024",
    role: "Freelance WordPress Developer",
    company: "Fiverr",
    desc: "Developed WordPress websites for clients worldwide, specializing in custom theme development, plugin integration, and SEO optimization.",
    icon: Handshake,
  },
];
