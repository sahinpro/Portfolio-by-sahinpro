import { PROFILE, resolveHeroDescription } from "@/constants/profile";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { useMemo } from "react";
import {
  type AboutCodeProfile,
  buildAboutCode,
  buildTerminalLines,
  defaultPlatforms,
  defaultStack,
  type TerminalLine,
} from "./aboutCodeContent";

const FALLBACK_NAME = PROFILE.name;
const FALLBACK_ROLE = PROFILE.role;

export function useAboutCodeProfile(): {
  profile: AboutCodeProfile;
  code: string;
  terminalLines: TerminalLine[];
  loading: boolean;
} {
  const { settings, loading: settingsLoading } = useSiteSettingsMap();

  const profile = useMemo<AboutCodeProfile>(() => {
    return {
      name: settings.hero_title?.trim() || FALLBACK_NAME,
      role: FALLBACK_ROLE,
      bio: resolveHeroDescription(settings.hero_description),
      stack: defaultStack(),
      platforms: defaultPlatforms(),
      available: settings.availability_status !== "unavailable",
    };
  }, [settings]);

  const code = useMemo(() => buildAboutCode(profile), [profile]);
  const terminalLines = useMemo(() => buildTerminalLines(profile), [profile]);

  return {
    profile,
    code,
    terminalLines,
    loading: settingsLoading,
  };
}
