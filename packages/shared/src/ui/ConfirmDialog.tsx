import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger,
  onConfirm,
  onCancel,
}: Props): JSX.Element | null {
  if (!open) return null;
  const confirmButtonClass = danger
    ? "rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500"
    : "rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90";
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="Close"
        onClick={onCancel}
      />
      <div
        className="relative max-w-md rounded-xl border border-white/[0.1] bg-[#141414] p-6 shadow-2xl"
        role="alertdialog"
        aria-modal="true"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <div className="mt-2 text-sm text-white/60">{message}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/80
              hover:bg-white/[0.06]"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={confirmButtonClass}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
