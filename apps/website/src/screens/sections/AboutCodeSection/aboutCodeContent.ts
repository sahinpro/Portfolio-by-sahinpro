import {
  PROFILE_PLATFORMS,
  PROFILE_STACK,
  PROFILE_TYPEWRITER_FALLBACK,
} from "@/constants/profile";

export type AboutCodeProfile = {
  name: string;
  role: string;
  focus: string;
  mindset: string;
  highlights: string[];
  certifications: string[];
  stack: string[];
  platforms: string[];
  available: boolean;
};

const DEFAULT_STACK = [...PROFILE_STACK];
const DEFAULT_PLATFORMS = [...PROFILE_PLATFORMS];

const TYPEWRITER_FALLBACK = [...PROFILE_TYPEWRITER_FALLBACK];

function escapeJsString(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\s+/g, " ")
    .trim();
}

export function parseTypewriterWords(raw: string | undefined): string[] {
  try {
    const trimmed = raw?.trim();
    if (!trimmed) return TYPEWRITER_FALLBACK;
    const parsed = JSON.parse(trimmed) as unknown;
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item) => typeof item === "string")
    ) {
      return TYPEWRITER_FALLBACK;
    }
    return parsed.length ? parsed : TYPEWRITER_FALLBACK;
  } catch {
    return TYPEWRITER_FALLBACK;
  }
}

function formatStringArray(items: string[]): string {
  return items.map((item) => `      "${escapeJsString(item)}",`).join("\n");
}

export function buildAboutCode(profile: AboutCodeProfile): string {
  const highlightLines = formatStringArray(profile.highlights);
  const certificationLines = formatStringArray(profile.certifications);

  return `class Developer {
  constructor() {
    this.name = "${escapeJsString(profile.name)}"
    this.role = "${escapeJsString(profile.role)}";
    this.focus = "${escapeJsString(profile.focus)}";
    this.mindset = "${escapeJsString(profile.mindset)}";
    this.highlights = [
${highlightLines}
    ];
    this.certifications = [
${certificationLines}
    ];
  }
}`;
}

export function defaultStack(): string[] {
  return DEFAULT_STACK;
}

export function defaultPlatforms(): string[] {
  return DEFAULT_PLATFORMS;
}

export type TerminalLine = {
  command: string;
  output: string;
};

export function buildTerminalLines(profile: AboutCodeProfile): TerminalLine[] {
  const stackLine = profile.stack.join(" · ");
  const platformLine = profile.platforms.join(" · ");
  return [
    { command: "whoami", output: profile.name },
    { command: "cat stack.txt", output: stackLine },
    { command: "cat platforms.txt", output: platformLine },
    {
      command: 'grep -i "hire" availability.log',
      output: profile.available
        ? "Status: open to new projects ✓"
        : "Status: booked    still happy to chat",
    },
    { command: "open portfolio --about", output: "→ /about" },
  ];
}
