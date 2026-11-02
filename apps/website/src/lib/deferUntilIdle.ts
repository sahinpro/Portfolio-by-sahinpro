/**
 * After first paint + idle. Does not wait for `window.load`.
 * Use for below-fold UI that should start soon without blocking the hero.
 */
export function deferAfterPaint(
  callback: () => void,
  timeoutMs = 400,
): () => void {
  if (typeof window === "undefined") return () => {};

  let cancelled = false;
  let idleId: number | undefined;
  let timeoutId: number | undefined;
  let raf2 = 0;

  const raf1 = window.requestAnimationFrame(() => {
    raf2 = window.requestAnimationFrame(() => {
      if (cancelled) return;

      const run = (): void => {
        if (!cancelled) callback();
      };

      if (typeof window.requestIdleCallback === "function") {
        idleId = window.requestIdleCallback(run, { timeout: timeoutMs });
      } else {
        timeoutId = window.setTimeout(run, timeoutMs);
      }
    });
  });

  return () => {
    cancelled = true;
    window.cancelAnimationFrame(raf1);
    window.cancelAnimationFrame(raf2);
    if (idleId !== undefined) window.cancelIdleCallback(idleId);
    if (timeoutId !== undefined) window.clearTimeout(timeoutId);
  };
}

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
