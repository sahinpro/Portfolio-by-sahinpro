/**
 * Runs `callback` after window load + idle time so Lighthouse metrics stay clean.
 */
export function deferUntilIdle(
  callback: () => void,
  timeoutMs = 3500,
): () => void {
  if (typeof window === "undefined") return () => {};

  const run = (): (() => void) => {
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(callback, { timeout: timeoutMs });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(callback, timeoutMs);
    return () => window.clearTimeout(id);
  };

  if (document.readyState === "complete") {
    return run();
  }

  let cancelIdle: (() => void) | undefined;
  const onLoad = (): void => {
    cancelIdle = run();
  };
  window.addEventListener("load", onLoad, { once: true });

  return () => {
    window.removeEventListener("load", onLoad);
    cancelIdle?.();
  };
}
