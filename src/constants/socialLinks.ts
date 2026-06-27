import { PROFILE } from "@/constants/profile";

export type SocialLink = {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
};

/** Hardcoded social links shown in hero, footer, and contact. */
export const SOCIAL_LINKS: SocialLink[] = [
  {
    id: "linkedin",
    platform: "LinkedIn",
    url: PROFILE.linkedIn,
    icon: "linkedin",
  },
  {
    id: "x",
    platform: "X",
    url: PROFILE.x,
    icon: "x",
  },
  {
    id: "medium",
    platform: "Medium",
    url: PROFILE.medium,
    icon: "medium",
  },
  {
    id: "hashnode",
    platform: "Hashnode",
    url: PROFILE.hashnode,
    icon: "hashnode",
  },
  {
    id: "behance",
    platform: "Behance",
    url: PROFILE.behance,
    icon: "behance",
  },
];
