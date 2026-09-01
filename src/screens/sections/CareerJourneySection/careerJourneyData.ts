import { PROFILE } from "@/constants/profile";
import type { LucideIcon } from "lucide-react";
import { Briefcase, Rocket } from "lucide-react";

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
    desc: "Built and delivered 200+ client sites with WordPress, WooCommerce, and Shopify; developed paydios front-end landing page completed 200+ projects and improved load speed 40%+ via Core Web Vitals work.",
    icon: Briefcase,
  },
  {
    year: "Feb 2023–Present",
    role: "WordPress Developer",
    company: "Self-employed",
    desc: "WordPress, WooCommerce, and Shopify for local and international clients    custom stores, landing pages, theme customization, on-page SEO, and full project lifecycle from scoping to post-launch support.",
    icon: Rocket,
  },
];
