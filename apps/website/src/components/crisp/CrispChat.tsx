"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";
import { env } from "@sahinpro/shared/env";

/**
 * Run a callback once the browser is idle so the third-party Crisp bundle
 * never competes with the initial render (LCP / TBT) of the public site.
 * Returns a cleanup function that cancels the pending callback.
 */
function onBrowserIdle(callback: () => void): () => void {
  const idleWindow = window as Window & {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
  };

  if (typeof idleWindow.requestIdleCallback === "function") {
    const handle = idleWindow.requestIdleCallback(callback, { timeout: 4000 });
    return () => idleWindow.cancelIdleCallback?.(handle);
  }

  const timer = window.setTimeout(callback, 1200);
  return () => window.clearTimeout(timer);
}

/**
 * Crisp live-chat widget for the public site. Renders nothing — it only
 * injects the Crisp script (lazily, on browser idle) when
 * `NEXT_PUBLIC_CRISP_WEBSITE_ID` is configured; otherwise the site stays
 * completely free of the widget. Mounted exactly once from
 * `PublicLayoutShell`; `isCrispInjected()` keeps double mounts (e.g. React
 * StrictMode) from loading the script twice.
 */
export function CrispChat(): JSX.Element | null {
  const websiteId = env.crispWebsiteId;

  useEffect(() => {
    if (!websiteId || Crisp.isCrispInjected()) return;

    // autoload:false — the script is only fetched once the browser goes idle.
    Crisp.configure(websiteId, { autoload: false, safeMode: true });
    const deferLoad = onBrowserIdle(() => Crisp.load());

    // Flag an open chatbox on <body> so page-level UI (modals, sticky CTAs)
    // can adjust around the slider if needed.
    const onChatOpened = () => document.body.classList.add("crisp-chat-open");
    const onChatClosed = () => document.body.classList.remove("crisp-chat-open");
    Crisp.chat.onChatOpened(onChatOpened);
    Crisp.chat.onChatClosed(onChatClosed);

    return () => {
      deferLoad();
      Crisp.chat.offChatOpened();
      Crisp.chat.offChatClosed();
      document.body.classList.remove("crisp-chat-open");
    };
  }, [websiteId]);

  // No DOM of its own — Crisp injects its widget into <body> itself.
  return null;
}
