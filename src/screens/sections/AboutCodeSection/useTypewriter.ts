import { useEffect, useState } from "react";

type UseTypewriterOptions = {
  active: boolean;
  instant: boolean;
  charDelayMs?: number;
  linePauseMs?: number;
};

export function useTypewriter(
  text: string,
  { active, instant, charDelayMs = 18, linePauseMs = 120 }: UseTypewriterOptions,
): { display: string; done: boolean; skip: () => void } {
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) return;
    if (instant) {
      setIndex(text.length);
      setDone(true);
      return;
    }
    setIndex(0);
    setDone(false);
  }, [text, active, instant]);

  useEffect(() => {
    if (!active || instant || done) return;
    if (index >= text.length) {
      setDone(true);
      return;
    }

    const prev = text[index - 1];
    const delay = prev === "\n" ? linePauseMs : charDelayMs;

    const timer = window.setTimeout(() => {
      setIndex((value) => value + 1);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [active, instant, done, index, text, charDelayMs, linePauseMs]);

  const skip = () => {
    setIndex(text.length);
    setDone(true);
  };

  return {
    display: instant ? text : text.slice(0, index),
    done,
    skip,
  };
}
