export type AboutCodeProfile = {
  name: string;
  role: string;
  bio: string;
  stack: string[];
  available: boolean;
};

const DEFAULT_STACK = [
  "React",
  "Next.js",
  "TypeScript",
  "Node.js",
  "WordPress",
  "Tailwind CSS",
];

const TYPEWRITER_FALLBACK = [
  "Front-End Web Developer",
  "Writing clean, efficient and impactful code",
];

function escapeJsString(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\s+/g, " ").trim();
}

export function parseTypewriterWords(raw: string | undefined): string[] {
  try {
    const trimmed = raw?.trim();
    if (!trimmed) return TYPEWRITER_FALLBACK;
    const parsed = JSON.parse(trimmed) as unknown;
    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      return TYPEWRITER_FALLBACK;
    }
    return parsed.length ? parsed : TYPEWRITER_FALLBACK;
  } catch {
    return TYPEWRITER_FALLBACK;
  }
}

export function buildAboutCode(profile: AboutCodeProfile): string {
  const stackLines = profile.stack.map((item) => `    "${item}",`).join("\n");

  return `// about.ts — a quick intro
export const developer = {
  name: "${escapeJsString(profile.name)}",
  role: "${escapeJsString(profile.role)}",
  bio: "${escapeJsString(profile.bio)}",
  stack: [
${stackLines}
  ],
  available: ${profile.available},
} as const;

console.log(\`Hello, I'm \${developer.name}! 👋\`);
console.log(developer.role);`;
}

export function defaultStack(): string[] {
  return DEFAULT_STACK;
}

export type TerminalLine = {
  command: string;
  output: string;
};

export function buildTerminalLines(profile: AboutCodeProfile): TerminalLine[] {
  const stackLine = profile.stack.slice(0, 6).join(" · ");
  return [
    { command: "whoami", output: profile.name },
    { command: "cat skills.txt", output: stackLine },
    {
      command: 'grep -i "hire" availability.log',
      output: profile.available
        ? "Status: open to new projects ✓"
        : "Status: booked — still happy to chat",
    },
    { command: "open portfolio --about", output: "→ /about" },
  ];
}
