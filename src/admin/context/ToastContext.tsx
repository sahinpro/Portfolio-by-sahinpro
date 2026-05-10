import { cn } from "@/lib/utils";
import { Check, CircleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Toast = {
  id: number;
  message: string;
  variant: "success" | "error" | "warning";
  description?: string;
};

type ToastContextValue = {
  showToast: (
    message: string,
    variant?: "success" | "error" | "warning",
    description?: string,
  ) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

let toastId = 0;

/**
 * Dark toasts (community / Figma): #242C32 shell, elevation shadow, soft radial glow,
 * filled 32px status disc + contrasting glyph (green/white check, yellow/black alert, red/white X).
 */
const toastShell =
  "isolate overflow-hidden rounded-xl bg-[#242C32] shadow-[0px_16px_24px_rgba(0,0,0,0.14),0px_6px_30px_rgba(0,0,0,0.12),0px_8px_10px_rgba(0,0,0,0.2)]";

const toastStyles = {
  success: {
    glowClass:
      "pointer-events-none absolute left-1/2 top-1/2 size-[212px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(0,237,81,0.14)_0%,rgba(0,237,123,0)_72%)]",
    discClass: "bg-[#00DF80]",
    glyphClass: "text-white",
    iconSizeClass: "h-[15px] w-[15px]",
    Icon: Check,
    role: "status" as const,
  },
  error: {
    glowClass:
      "pointer-events-none absolute left-1/2 top-1/2 size-[240px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(240,66,72,0.16)_0%,rgba(240,66,72,0)_72%)]",
    discClass: "bg-[#F04248]",
    glyphClass: "text-white",
    iconSizeClass: "h-[15px] w-[15px]",
    Icon: X,
    role: "alert" as const,
  },
  warning: {
    glowClass:
      "pointer-events-none absolute left-1/2 top-1/2 size-[212px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,rgba(255,212,38,0.14)_0%,rgba(255,212,38,0)_72%)]",
    discClass: "bg-[#FFD21E]",
    glyphClass: "text-zinc-950",
    iconSizeClass: "h-[18px] w-[18px]",
    Icon: CircleAlert,
    role: "status" as const,
  },
} as const;

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (
      message: string,
      variant: "success" | "error" | "warning" = "success",
      description?: string,
    ) => {
      const id = ++toastId;
      setToasts((t) => [...t, { id, message, variant, description }]);
      window.setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 4200);
    },
    [],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-6 right-6 z-[200] flex w-full max-w-[min(100vw-1.5rem,343px)] flex-col gap-3"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const s = toastStyles[t.variant];
          const Icon = s.Icon;
          return (
            <div
              key={t.id}
              role={s.role}
              className={cn(
                "pointer-events-auto relative flex min-h-[64px] items-center gap-4 px-4 py-3 font-sans",
                toastShell,
              )}
            >
              <div className="relative isolate z-0 flex h-8 w-8 shrink-0 items-center justify-center">
                <span className={cn("absolute z-0", s.glowClass)} aria-hidden />
                <span
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]",
                    s.discClass,
                  )}
                  aria-hidden
                >
                  <Icon className={cn(s.iconSizeClass, s.glyphClass)} strokeWidth={2.75} />
                </span>
              </div>
              <div
                className="z-[1] flex min-w-0 flex-1 flex-col gap-0.5 text-left [font-family:system-ui,-apple-system,'SF_Pro_Text',sans-serif]"
              >
                <p className="text-[17px] font-semibold leading-[22px] tracking-[-0.408px] text-white">
                  {t.message}
                </p>
                {t.description ? (
                  <p className="text-[13px] font-normal leading-[18px] tracking-[-0.078px] text-[#C8C5C5]">
                    {t.description}
                  </p>
                ) : null}
              </div>
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
