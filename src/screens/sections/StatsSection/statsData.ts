import type { LucideIcon } from "lucide-react";
import { Calendar, Code2, Heart, Users } from "lucide-react";

export type PortfolioStat = {
  icon: LucideIcon;
  value: string;
  label: string;
  color: string;
  border: string;
};

export const portfolioStats: PortfolioStat[] = [
  {
    icon: Code2,
    value: "300+",
    label: "Completed Projects",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/20",
  },
  {
    icon: Calendar,
    value: "3+",
    label: "Years of Experience",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/20",
  },
  {
    icon: Users,
    value: "100%",
    label: "Client Satisfaction",
    color: "from-emerald-500/20 to-teal-500/10",
    border: "border-emerald-500/20",
  },
  {
    icon: Heart,
    value: "15+",
    label: "Technologies Mastered",
    color: "from-rose-500/20 to-pink-500/10",
    border: "border-rose-500/20",
  },
];
