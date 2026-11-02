import type { LucideIcon } from "lucide-react";
import { Calendar, Code2 } from "lucide-react";

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
    value: "200+",
    label: "Websites Delivered",
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
];
