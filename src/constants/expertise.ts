import { portfolioStats } from "@/screens/sections/StatsSection/statsData";

export type ExpertiseCategory = {
  category: string;
  skills: string[];
  iconKey: string;
};

export const EXPERTISE_CATEGORIES: ExpertiseCategory[] = [
  {
    category: "Frontend Development",
    iconKey: "frontend",
    skills: ["HTML", "CSS", "Tailwind CSS", "JavaScript", "React", "Next.js"],
  },
  {
    category: "Backend Development",
    iconKey: "backend",
    skills: ["PHP", "Node.js", "Express.js"],
  },
  {
    category: "Databases",
    iconKey: "database",
    skills: ["MySQL", "MongoDB"],
  },
  {
    category: "CMS & E-commerce",
    iconKey: "cms",
    skills: ["WordPress", "Wix", "Shopify", "WooCommerce"],
  },
  {
    category: "Design Tools",
    iconKey: "design",
    skills: ["Figma", "Adobe XD"],
  },
  {
    category: "Other Technologies",
    iconKey: "other",
    skills: ["Git", "REST APIs", "SEO Optimization", "Responsive Design"],
  },
];

export type ServiceSummary = {
  id: string;
  title: string;
  description: string;
  tag: string;
  accent: string;
  border: string;
  buttonAccent: string;
  features: string[];
};

export const SERVICE_DEFINITIONS: ServiceSummary[] = [
  {
    id: "ui-ux",
    title: "UI/UX Design",
    description:
      "Beautiful, user-friendly interfaces that align with your brand, optimised for conversion and delight.",
    tag: "Design",
    accent: "from-pink-500/10 to-rose-500/5",
    border: "border-pink-500/20",
    buttonAccent: "bg-pink-500/20 border-pink-500/30 hover:bg-pink-500/30",
    features: [
      "Figma Prototyping",
      "Design Systems",
      "Responsive Design",
      "Accessibility (WCAG)",
    ],
  },
  {
    id: "full-stack",
    title: "Full Stack Development",
    description:
      "End-to-end web applications from database design to pixel-perfect frontend — built to scale.",
    tag: "Dev",
    accent: "from-yellow-500/10 to-amber-500/5",
    border: "border-yellow-500/20",
    buttonAccent:
      "bg-yellow-500/20 border-yellow-500/30 hover:bg-yellow-500/30",
    features: [
      "React & Next.js",
      "Node.js & Express",
      "MongoDB / PostgreSQL",
      "REST & GraphQL APIs",
    ],
  },
  {
    id: "wordpress",
    title: "WordPress Development",
    description:
      "Professional, fast, and SEO-ready WordPress builds — themes, plugins, and full custom sites.",
    tag: "CMS",
    accent: "from-blue-500/10 to-cyan-500/5",
    border: "border-blue-500/20",
    buttonAccent: "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30",
    features: [
      "Custom Themes",
      "Plugin Development",
      "WooCommerce",
      "Gutenberg Blocks",
    ],
  },
  {
    id: "ecommerce",
    title: "E-Commerce Solutions",
    description:
      "Complete e-commerce with WooCommerce or Shopify — from product pages to checkout and beyond.",
    tag: "E-Commerce",
    accent: "from-emerald-500/10 to-teal-500/5",
    border: "border-emerald-500/20",
    buttonAccent:
      "bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30",
    features: [
      "WooCommerce & Shopify",
      "Payment Integration",
      "Inventory Management",
      "Order Automation",
    ],
  },
  {
    id: "performance",
    title: "Performance & SEO",
    description:
      "Speed optimisation, Core Web Vitals improvements, and technical SEO to help you rank and retain.",
    tag: "Growth",
    accent: "from-violet-500/10 to-purple-500/5",
    border: "border-violet-500/20",
    buttonAccent:
      "bg-violet-500/20 border-violet-500/30 hover:bg-violet-500/30",
    features: [
      "Core Web Vitals",
      "Technical SEO Audit",
      "Image & Code Optimisation",
      "Analytics Setup",
    ],
  },
  {
    id: "maintenance",
    title: "Maintenance & Support",
    description:
      "Ongoing peace of mind — regular updates, security monitoring, and fast response to any issues.",
    tag: "Support",
    accent: "from-orange-500/10 to-red-500/5",
    border: "border-orange-500/20",
    buttonAccent:
      "bg-orange-500/20 border-orange-500/30 hover:bg-orange-500/30",
    features: [
      "Regular Updates",
      "Security Scanning",
      "Daily Backups",
      "Priority Support",
    ],
  },
];

/** Compact cards shown on the homepage — link to full services page */
export const SERVICE_HOME_CARDS = SERVICE_DEFINITIONS.filter((s) =>
  ["full-stack", "wordpress", "ecommerce", "performance"].includes(s.id),
);

export const PROOF_STATS = portfolioStats;

export type ProofCard = {
  title: string;
  description: string;
  badges?: string[];
  iconKey: "delivery" | "speed" | "satisfaction" | "support";
};

export const WHY_CHOOSE_PROOF_CARDS: ProofCard[] = [
  {
    iconKey: "delivery",
    title: "200+ sites shipped",
    description:
      "WordPress, WooCommerce, Shopify, and React builds delivered for agencies and direct clients.",
    badges: ["WordPress", "Shopify", "React"],
  },
  {
    iconKey: "speed",
    title: "40%+ faster loads",
    description:
      "Core Web Vitals optimisation on client sites — including pkpayplus.com and agency storefronts.",
  },
  {
    iconKey: "satisfaction",
    title: "100% client satisfaction",
    description:
      "Clear milestones, responsive communication, and post-launch support on every engagement.",
  },
  {
    iconKey: "support",
    title: "End-to-end delivery",
    description:
      "From Figma/PSD handoff to deployment — scoping, build, QA, and handover documentation.",
  },
];
