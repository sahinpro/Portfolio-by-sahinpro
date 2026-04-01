import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useEffect } from "react";

type Props = {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
};

export function AdminSidePanel({ title, description, onClose, children }: Props): JSX.Element {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-[2px] animate-in fade-in-0 duration-200 lg:left-[17.5rem]"
      />
      <aside
        className="fixed inset-y-0 right-0 z-[120] flex w-full max-w-xl flex-col border-l border-white/[0.08]
          bg-zinc-950 shadow-2xl shadow-black/60 animate-in slide-in-from-right-10 fade-in-0 duration-300 sm:max-w-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            {description ? <p className="mt-1 text-sm text-white/45">{description}</p> : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onClose}
            className="shrink-0 border-white/[0.08] bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="min-h-0 flex-1">
          <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
        </ScrollArea>
      </aside>
    </>
  );
}
