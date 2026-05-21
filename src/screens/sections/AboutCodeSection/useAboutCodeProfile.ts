import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { useMemo } from "react";
import {
  type AboutCodeProfile,
  buildAboutCode,
  buildTerminalLines,
  defaultStack,
  parseTypewriterWords,
  type TerminalLine,
} from "./aboutCodeContent";

const FALLBACK_NAME = "Sahin Alam";
const FALLBACK_ROLE = "Full Stack Web Developer";
const FALLBACK_BIO =
  "Web Designer & Developer specializing in WordPress, now diving into Full Stack Web Development.";

export function useAboutCodeProfile(): {
  profile: AboutCodeProfile;
  code: string;
  terminalLines: TerminalLine[];
  loading: boolean;
} {
  const { settings, loading: settingsLoading } = useSiteSettingsMap();

  const profile = useMemo<AboutCodeProfile>(() => {
    const typewriterWords = parseTypewriterWords(settings.hero_typewriter_words);
    const role =
      typewriterWords[0]?.replace(/\.$/, "") || FALLBACK_ROLE;

    return {
      name: settings.hero_title?.trim() || FALLBACK_NAME,
      role,
      bio: settings.hero_description?.trim() || FALLBACK_BIO,
      stack: defaultStack(),
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
