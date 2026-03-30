import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import {
  type MediaBucketId,
  type MediaLibraryItem,
  listAllMediaInBucket,
  updateMediaItemMetadata,
} from "@/admin/lib/listMediaFiles";
import { cn } from "@/lib/utils";
import { Check, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

function isProbablyImage(item: MediaLibraryItem): boolean {
  const m = item.mimeType?.toLowerCase() ?? "";
  if (m.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(item.name);
}

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white outline-none focus:border-white/20";

type MediaLibraryPickerModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bucket: MediaBucketId;
  onPick: (publicUrl: string) => void;
};

export function MediaLibraryPickerModal({
  open,
  onOpenChange,
  bucket,
  onPick,
}: MediaLibraryPickerModalProps): JSX.Element | null {
  const { showToast } = useToast();
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<MediaLibraryItem | null>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllMediaInBucket(bucket);
      setItems(list);
    } catch (e) {
      showToast(withRlsHint(e instanceof Error ? e.message : "Could not load library"), "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [bucket, showToast]);

  useEffect(() => {
    if (!open) return;
    void load();
    setSelected(null);
    setTitle("");
    setAlt("");
    setCaption("");
  }, [open, load]);

  useEffect(() => {
    if (!selected) {
      setTitle("");
      setAlt("");
      setCaption("");
      return;
    }
    setTitle(selected.title ?? "");
    setAlt(selected.alt ?? "");
    setCaption(selected.caption ?? "");
  }, [selected]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const saveMeta = async () => {
    if (!selected) return;
    setSavingMeta(true);
    try {
      await updateMediaItemMetadata(selected, { title, alt, caption });
      showToast("Details saved");
      const list = await listAllMediaInBucket(bucket);
      setItems(list);
      const next = list.find((x) => x.path === selected.path && x.bucket === selected.bucket);
      if (next) setSelected(next);
    } catch (e) {
      showToast(withRlsHint(e instanceof Error ? e.message : "Save failed"), "error");
    } finally {
      setSavingMeta(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div
        className="relative z-[101] flex max-h-[min(90vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
      >
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <h2 id="media-picker-title" className="text-sm font-semibold text-white">
            Choose from library
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_280px]">
          <div className="min-h-[240px] overflow-y-auto border-b border-white/[0.06] p-3 md:border-b-0 md:border-r">
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-2 text-sm text-white/45">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-white/40">No files in this bucket yet.</p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((item) => {
                  const img = isProbablyImage(item);
                  const isSel = selected?.path === item.path && selected?.bucket === item.bucket;
                  return (
                    <li key={`${item.bucket}:${item.path}`}>
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className={cn(
                          "group relative w-full overflow-hidden rounded-xl border text-left transition-colors",
                          isSel
                            ? "border-white/35 ring-2 ring-white/20"
                            : "border-white/[0.08] hover:border-white/[0.14]",
                        )}
                      >
                        <div className="aspect-square bg-black/50">
                          {img ? (
                            <img
                              src={item.publicUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-[10px] text-white/30">
                              File
                            </div>
                          )}
                        </div>
                        {isSel ? (
                          <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-black shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        ) : null}
                        <p className="truncate px-2 py-1.5 text-[10px] text-white/55">{item.name}</p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-3 p-4">
            <p className="text-[11px] text-white/40">Select an image, edit details, then insert.</p>
            {selected ? (
              <>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                    Title
                  </label>
                  <input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                    Alt text
                  </label>
                  <input className={field} value={alt} onChange={(e) => setAlt(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                    Caption
                  </label>
                  <textarea
                    className={`${field} min-h-[72px] resize-none`}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  disabled={savingMeta}
                  onClick={() => void saveMeta()}
                  className="rounded-lg border border-white/15 bg-white/[0.06] py-2 text-xs font-medium text-white/85 hover:bg-white/[0.1] disabled:opacity-50"
                >
                  {savingMeta ? "Saving…" : "Save details"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onPick(selected.publicUrl);
                    onOpenChange(false);
                  }}
                  className="mt-auto rounded-lg bg-white py-2.5 text-xs font-semibold text-black hover:bg-white/90"
                >
                  Use this image
                </button>
              </>
            ) : (
              <p className="text-xs text-white/35">Click a thumbnail to edit details or insert.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
