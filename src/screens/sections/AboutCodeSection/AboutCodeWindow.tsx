import { scrollViewport } from "@/constants/scrollMotion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { CodeEditorPanel, type EditorTab } from "./CodeEditorPanel";
import { TerminalPanel } from "./TerminalPanel";
import { aboutCodeChromeClass } from "./aboutCodeLayout";
import { useAboutCodeProfile } from "./useAboutCodeProfile";

type AboutCodeWindowProps = {
  className?: string;
  /** When true, content is ready as soon as mounted (hero). When false, waits for scroll into view. */
  startOnMount?: boolean;
};

export const AboutCodeWindow = ({
  className = "",
  startOnMount = false,
}: AboutCodeWindowProps): JSX.Element => {
  const windowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(windowRef, scrollViewport);
  const active = startOnMount || inView;

  const { profile, code, terminalLines } = useAboutCodeProfile();
  const [activeTab, setActiveTab] = useState<EditorTab>("developer.js");

  const terminal = (
    <TerminalPanel lines={terminalLines} active={active} instant />
  );

  return (
    <div ref={windowRef} className={className}>
      <div className={aboutCodeChromeClass}>
        <div className="pointer-events-none z-[9999] absolute inset-x-0 bottom-0 h-[150px] w-[96%] mx-auto scale-[1.05] bg-gradient-to-b from-transparent via-black/45 to-black rounded-b-[25px]" />
        <div className="relative rounded-[16px] lg:rounded-[19px] bg-[#0f0f0f] overflow-hidden">
          <CodeEditorPanel
            code={code}
            active={active}
            instant
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSkip={() => undefined}
            onTypingComplete={() => undefined}
            terminal={terminal}
          />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {profile.name}, {profile.role}. {profile.highlights.join(". ")}
      </p>
    </div>
  );
};
