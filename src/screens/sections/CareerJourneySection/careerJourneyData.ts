import { PROFILE } from "@/constants/profile";
import type { LucideIcon } from "lucide-react";
import { Briefcase, GraduationCap, Rocket } from "lucide-react";

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
    desc: "Built and delivered 200+ client sites with WordPress, WooCommerce, and Shopify; developed pkpayplus.com (Next.js payment gateway); converted 200+ Figma/PSD designs; improved load speed 40%+ via Core Web Vitals work.",
    icon: Briefcase,
  },
  {
    year: "Feb 2023–Present",
    role: "WordPress Developer",
    company: "Self-employed",
    desc: "WordPress, WooCommerce, and Shopify for local and international clients — custom stores, landing pages, theme customization, on-page SEO, and full project lifecycle from scoping to post-launch support.",
    icon: Rocket,
  },
  {
    year: "2018–2020",
    role: "SSC, Science",
    company: "Rotargoan High School & College",
    desc: "Completed secondary education in science before focusing on web development and client work.",
    icon: GraduationCap,
  },
];
