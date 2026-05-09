import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type PromptState = {
  title: string;
  message: ReactNode;
  variant: "confirm" | "acknowledge";
  confirmLabel: string;
  cancelLabel: string;
  resolve: (value: boolean) => void;
};

type OpenPromptArgs = {
  title: string;
  message: ReactNode;
  variant: "confirm" | "acknowledge";
  confirmLabel?: string;
  cancelLabel?: string;
};

type DuplicateUploadConfirmContextValue = {
  openPrompt: (args: OpenPromptArgs) => Promise<boolean>;
};

const DuplicateUploadConfirmContext = createContext<DuplicateUploadConfirmContextValue | null>(
  null,
);

export function DuplicateUploadConfirmProvider({ children }: { children: ReactNode }): JSX.Element {
  const [prompt, setPrompt] = useState<PromptState | null>(null);

  const openPrompt = useCallback((args: OpenPromptArgs) => {
    return new Promise<boolean>((resolve) => {
      setPrompt({
        title: args.title,
        message: args.message,
        variant: args.variant,
        confirmLabel: args.confirmLabel ?? (args.variant === "acknowledge" ? "OK" : "Continue"),
        cancelLabel: args.cancelLabel ?? "Cancel",
        resolve,
      });
    });
  }, []);

  const finish = useCallback((value: boolean) => {
    setPrompt((p) => {
      p?.resolve(value);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!prompt) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopPropagation();
      finish(prompt.variant === "acknowledge");
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [prompt, finish]);

  const value = useMemo(() => ({ openPrompt }), [openPrompt]);

  return (
    <DuplicateUploadConfirmContext.Provider value={value}>
      {children}
      {prompt ? (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            aria-label="Close"
            onClick={() => finish(prompt.variant === "acknowledge")}
          />
          <div
            className="relative max-w-md rounded-xl border border-amber-500/25 bg-[#141414] p-6 shadow-2xl ring-1 ring-amber-500/15"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="dup-upload-title"
            aria-describedby="dup-upload-desc"
          >
            <div className="flex gap-3">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/12 text-amber-300 ring-1 ring-amber-400/25"
                aria-hidden
              >
                <AlertTriangle className="h-5 w-5" strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <h3 id="dup-upload-title" className="text-lg font-semibold text-white">
                  {prompt.title}
                </h3>
                <div id="dup-upload-desc" className="mt-2 text-sm text-white/65 leading-relaxed">
                  {prompt.message}
                </div>
              </div>
            </div>
            <div
              className={cn(
                "mt-6 flex justify-end gap-2",
                prompt.variant === "acknowledge" && "sm:gap-3",
              )}
            >
              {prompt.variant === "confirm" ? (
                <>
                  <button
                    type="button"
                    onClick={() => finish(false)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/[0.06]"
                  >
                    {prompt.cancelLabel}
                  </button>
                  <button
                    type="button"
                    onClick={() => finish(true)}
                    className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                  >
                    {prompt.confirmLabel}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => finish(true)}
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400"
                >
                  {prompt.confirmLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </DuplicateUploadConfirmContext.Provider>
  );
}

export function useDuplicateUploadConfirm(): DuplicateUploadConfirmContextValue {
  const ctx = useContext(DuplicateUploadConfirmContext);
  if (!ctx) {
    return {
      openPrompt: async () => true,
    };
  }
  return ctx;
}

/** Single file: identical content already stored. */
export async function promptSingleDuplicateFile(
  openPrompt: DuplicateUploadConfirmContextValue["openPrompt"],
  fileName: string,
): Promise<boolean> {
  return openPrompt({
    variant: "confirm",
    title: "This file is already uploaded",
    message: (
      <>
        <span className="text-white/80">“{fileName}”</span> matches media already in storage (same
        content). No duplicate will be created. Use the existing file?
      </>
    ),
    confirmLabel: "Use existing file",
    cancelLabel: "Cancel",
  });
}

/** Batch: some or all files were duplicates. */
export async function promptBatchDuplicateFiles(
  openPrompt: DuplicateUploadConfirmContextValue["openPrompt"],
  newCount: number,
  duplicateCount: number,
): Promise<boolean> {
  if (duplicateCount <= 0) return true;
  if (newCount === 0) {
    return openPrompt({
      variant: "confirm",
      title: "All files already exist",
      message: (
        <>
          Every selected file matches content already in storage. Links will point to those existing
          files. Continue?
        </>
      ),
      confirmLabel: "Use existing files",
      cancelLabel: "Cancel",
    });
  }
  return openPrompt({
    variant: "confirm",
    title: "Some files already exist",
    message: (
      <>
        <span className="tabular-nums text-white/85">{duplicateCount}</span> file
        {duplicateCount === 1 ? "" : "s"} match existing media;{" "}
        <span className="tabular-nums text-white/85">{newCount}</span> will be uploaded as new. Add
        all links anyway?
      </>
    ),
    confirmLabel: "Continue",
    cancelLabel: "Cancel",
  });
}

/** One-button notice after uploads that included duplicates (e.g. media library). */
export async function acknowledgeDuplicateUploads(
  openPrompt: DuplicateUploadConfirmContextValue["openPrompt"],
  duplicateCount: number,
  newCount: number,
): Promise<void> {
  if (duplicateCount <= 0) return;
  let message: ReactNode;
  if (newCount === 0) {
    message = (
      <>
        All <span className="tabular-nums text-white/85">{duplicateCount}</span> file
        {duplicateCount === 1 ? " was" : "s were"} already in your library. Nothing new was
        uploaded.
      </>
    );
  } else {
    message = (
      <>
        <span className="tabular-nums text-white/85">{newCount}</span> new file
        {newCount === 1 ? "" : "s"} added;{" "}
        <span className="tabular-nums text-white/85">{duplicateCount}</span> duplicate
        {duplicateCount === 1 ? "" : "s"} skipped (same content already stored).
      </>
    );
  }
  await openPrompt({
    variant: "acknowledge",
    title: "Duplicate files detected",
    message,
    confirmLabel: "OK",
  });
}
