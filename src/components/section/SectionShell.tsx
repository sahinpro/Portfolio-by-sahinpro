import Glow from "@/components/ui/glow";
import { sectionInnerClass, sectionShellClass } from "@/constants/layout";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  glow?: "top" | "center" | false;
};

export function SectionShell({
  id,
  children,
  className,
  glow = false,
}: SectionShellProps): JSX.Element {
  return (
    <section id={id} className={cn(sectionShellClass, className)}>
      {glow ? (
        <Glow
          variant={glow === "center" ? "center" : "top"}
          className="-z-20 blur-xl opacity-40"
        />
      ) : null}
      <div className={sectionInnerClass}>{children}</div>
    </section>
  );
}
