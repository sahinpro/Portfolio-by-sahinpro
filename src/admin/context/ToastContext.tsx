import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Toast = { id: number; message: string; variant: "success" | "error" };

type ToastContextValue = {
  showToast: (message: string, variant?: "success" | "error") => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

const toastStyles = {
  success: {
    shell:
      "border-white/[0.08] bg-zinc-950/95 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md ring-1 ring-inset ring-emerald-500/20",
    accent: "bg-emerald-500/12 text-emerald-400 ring-1 ring-emerald-400/25",
    text: "text-zinc-100",
    borderLeft: "border-l-[3px] border-l-emerald-500",
    Icon: CheckCircle2,
  },
  error: {
    shell:
      "border-white/[0.08] bg-zinc-950/95 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.85)] backdrop-blur-md ring-1 ring-inset ring-red-500/20",
    accent: "bg-red-500/12 text-red-400 ring-1 ring-red-400/25",
    text: "text-zinc-100",
    borderLeft: "border-l-[3px] border-l-red-500",
    Icon: AlertCircle,
  },
} as const;

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, variant: "success" | "error" = "success") => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, variant }]);
    window.setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 4200);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[200] flex max-w-[min(100vw-1.5rem,22rem)] flex-col gap-2.5"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const s = toastStyles[t.variant];
          const Icon = s.Icon;
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border py-3 pl-3.5 pr-4",
                s.borderLeft,
                s.shell,
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  s.accent,
                )}
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={2.25} />
              </span>
              <p className={cn("min-w-0 flex-1 pt-0.5 text-sm font-medium leading-snug", s.text)}>
                {t.message}
              </p>

            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return { showToast: () => {} };
  }
  return ctx;
}
