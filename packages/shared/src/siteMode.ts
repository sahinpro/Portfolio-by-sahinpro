export const COMING_SOON_MODE_KEY = "coming_soon_mode";
export const COMING_SOON_BADGE_KEY = "coming_soon_badge";
export const COMING_SOON_TITLE_KEY = "coming_soon_title";
export const COMING_SOON_MESSAGE_KEY = "coming_soon_message";
export const COMING_SOON_NOTE_KEY = "coming_soon_note";
export const COMING_SOON_PROGRESS_KEY = "coming_soon_progress";
export const COMING_SOON_PROGRESS_LABEL_KEY = "coming_soon_progress_label";

export const DEFAULT_COMING_SOON_BADGE = "Coming Soon";
export const DEFAULT_COMING_SOON_TITLE = "A refined experience is on the way";
export const DEFAULT_COMING_SOON_MESSAGE =
  "The site is temporarily unavailable while we prepare a more polished launch. Please check back shortly.";
export const DEFAULT_COMING_SOON_NOTE =
  "We are currently making focused improvements behind the scenes to deliver a cleaner, faster, and more complete experience.";
export const DEFAULT_COMING_SOON_PROGRESS = 78;
export const DEFAULT_COMING_SOON_PROGRESS_LABEL = "Launch progress";

export function isComingSoonEnabled(settings: Record<string, string>): boolean {
  return settings[COMING_SOON_MODE_KEY] === "enabled";
}

export function getComingSoonBadge(settings: Record<string, string>): string {
  return settings[COMING_SOON_BADGE_KEY]?.trim() || DEFAULT_COMING_SOON_BADGE;
}

export function getComingSoonTitle(settings: Record<string, string>): string {
  return settings[COMING_SOON_TITLE_KEY]?.trim() || DEFAULT_COMING_SOON_TITLE;
}

export function getComingSoonMessage(settings: Record<string, string>): string {
  return settings[COMING_SOON_MESSAGE_KEY]?.trim() || DEFAULT_COMING_SOON_MESSAGE;
}

export function getComingSoonNote(settings: Record<string, string>): string {
  return settings[COMING_SOON_NOTE_KEY]?.trim() || DEFAULT_COMING_SOON_NOTE;
}

export function getComingSoonProgress(settings: Record<string, string>): number {
  const value = Number(settings[COMING_SOON_PROGRESS_KEY] ?? "");
  if (!Number.isFinite(value)) return DEFAULT_COMING_SOON_PROGRESS;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function getComingSoonProgressLabel(settings: Record<string, string>): string {
  return settings[COMING_SOON_PROGRESS_LABEL_KEY]?.trim() || DEFAULT_COMING_SOON_PROGRESS_LABEL;
}

export type ComingSoonContent = {
  badge: string;
  title: string;
  message: string;
  note: string;
  progress: number;
  progressLabel: string;
};

export function getComingSoonContent(settings: Record<string, string>): ComingSoonContent {
  return {
    badge: getComingSoonBadge(settings),
    title: getComingSoonTitle(settings),
    message: getComingSoonMessage(settings),
    note: getComingSoonNote(settings),
    progress: getComingSoonProgress(settings),
    progressLabel: getComingSoonProgressLabel(settings),
  };
}
