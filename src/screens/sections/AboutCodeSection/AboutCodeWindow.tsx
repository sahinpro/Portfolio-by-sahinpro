import { scrollViewport } from "@/constants/scrollMotion";
import { useInView, useReducedMotion } from "framer-motion";
import { useCallback, useRef, useState } from "react";
import { CodeEditorPanel, type EditorTab } from "./CodeEditorPanel";
import { TerminalPanel } from "./TerminalPanel";
import { useAboutCodeProfile } from "./useAboutCodeProfile";

type AboutCodeWindowProps = {
  className?: string;
  /** When true, typing/terminal animate as soon as mounted (hero). When false, waits for scroll into view. */
  startOnMount?: boolean;
};

export const AboutCodeWindow = ({
  className = "",
  startOnMount = false,
}: AboutCodeWindowProps): JSX.Element => {
  const windowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(windowRef, scrollViewport);
  const reduceMotion = useReducedMotion();
  const instant = reduceMotion === true;

  const active = startOnMount || inView;

  const { profile, code, terminalLines, loading } = useAboutCodeProfile();
  const [activeTab, setActiveTab] = useState<EditorTab>("about.ts");
  const [codeComplete, setCodeComplete] = useState(instant);

  const markCodeComplete = useCallback(() => setCodeComplete(true), []);

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab);
    if (tab === "terminal") markCodeComplete();
  };

  const terminalActive = active && (codeComplete || instant);

  const terminal = (
    <TerminalPanel lines={terminalLines} active={terminalActive} instant={instant} />
  );

  return (
    <div ref={windowRef} className={className}>
      <div className="relative w-full rounded-[25px] lg:rounded-[28px] border border-white/10 backdrop-blur-xl bg-gradient-to-b from-white/30 to-white/50 p-2 lg:p-2.5">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 w-full scale-[1.05] bg-gradient-to-b from-transparent via-black/45 to-black rounded-b-[25px]" />
        <div className="relative rounded-[20px] lg:rounded-[22px] bg-[#0f0f0f] overflow-hidden">
          <CodeEditorPanel
            code={code}
            active={active}
            instant={instant}
            loading={loading}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onSkip={markCodeComplete}
            onTypingComplete={markCodeComplete}
            terminal={terminal}
          />
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {profile.name}, {profile.role}. {profile.bio}
      </p>
    </div>
  );
};
