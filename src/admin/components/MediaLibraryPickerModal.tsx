import {
  promptBatchDuplicateFiles,
  promptSingleDuplicateFile,
  useDuplicateUploadConfirm,
} from "@/admin/context/DuplicateUploadConfirmContext";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { isLikelyImageFile } from "@/admin/lib/imageFileAccept";
import {
  type MediaBucketId,
  type MediaLibraryItem,
  listAllMediaMerged,
  updateMediaItemMetadata,
} from "@/admin/lib/listMediaFiles";
import {
  storageUploadErrorMessage,
  uploadPublicFileContentAddressed,
} from "@/admin/lib/storageUpload";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Loader2, Upload, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

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
  /** Bucket for new uploads from this dialog (listing always shows all media). */
  uploadBucket: MediaBucketId;
  /** Storage path prefix for uploads (no leading/trailing slash), e.g. `blog`, `projects`. */
  pathPrefix: string;
  /** Default: single image selection (existing behavior). */
  mode?: "single" | "multiple";
  onPick: (publicUrl: string) => void;
  /** When `mode` is `"multiple"`, called with all chosen public URLs (deduped). */
  onPickMultiple?: (publicUrls: string[]) => void;
};

function itemKey(item: MediaLibraryItem): string {
  return `${item.bucket}:${item.path}`;
}

function normalizePathPrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, "");
}

export function MediaLibraryPickerModal({
  open,
  onOpenChange,
  uploadBucket,
  pathPrefix,
  mode = "single",
  onPick,
  onPickMultiple,
}: MediaLibraryPickerModalProps): JSX.Element | null {
  const { showToast } = useToast();
  const { openPrompt } = useDuplicateUploadConfirm();
  const fileRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaLibraryItem | null>(null);
  const [multiSelected, setMultiSelected] = useState<Set<string>>(() => new Set());
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllMediaMerged();
      setItems(list);
    } catch (e) {
      showToast(withRlsHint(e instanceof Error ? e.message : "Could not load library"), "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!open) return;
    void load();
    setSelected(null);
    setMultiSelected(new Set());
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
      const list = await listAllMediaMerged();
      setItems(list);
      const next = list.find((x) => x.path === selected.path && x.bucket === selected.bucket);
      if (next) setSelected(next);
    } catch (e) {
      showToast(withRlsHint(e instanceof Error ? e.message : "Save failed"), "error");
    } finally {
      setSavingMeta(false);
    }
  };

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    e.target.value = "";
    if (!files?.length) return;

    const prefix = normalizePathPrefix(pathPrefix);
    if (!prefix) {
      showToast("Invalid upload path", "error");
      return;
    }

    const list = Array.from(files);
    if (mode === "single") {
      const file = list[0];
      if (!file || !isLikelyImageFile(file)) {
        showToast("Choose an image file", "error");
        return;
      }
      setUploading(true);
      try {
        const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const { publicUrl, skippedUpload } = await uploadPublicFileContentAddressed(
          uploadBucket,
          prefix,
          file,
          { title: baseTitle },
        );
        if (skippedUpload) {
          const useExisting = await promptSingleDuplicateFile(openPrompt, file.name);
          if (!useExisting) return;
        } else {
          showToast("Uploaded");
        }
        await load();
        onPick(publicUrl);
        onOpenChange(false);
      } catch (err) {
        showToast(withRlsHint(storageUploadErrorMessage(err)), "error");
      } finally {
        setUploading(false);
      }
      return;
    }

    const images = list.filter((f) => isLikelyImageFile(f));
    if (images.length === 0) {
      showToast("Add image files only", "error");
      return;
    }

    setUploading(true);
    try {
      const newUrls: string[] = [];
      let skipped = 0;
      for (const file of images) {
        const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const { publicUrl, skippedUpload } = await uploadPublicFileContentAddressed(
          uploadBucket,
          prefix,
          file,
          { title: baseTitle },
        );
        newUrls.push(publicUrl);
        if (skippedUpload) skipped += 1;
      }
      const newCount = images.length - skipped;
      if (skipped > 0) {
        const proceed = await promptBatchDuplicateFiles(openPrompt, newCount, skipped);
        if (!proceed) return;
      }
      if (skipped === 0) {
        showToast(images.length === 1 ? "Uploaded" : `${images.length} images uploaded`);
      } else {
        showToast(
          newCount > 0
            ? `Added ${newCount} new image${newCount === 1 ? "" : "s"} (${skipped} existing reused)`
            : `Using ${skipped} existing image${skipped === 1 ? "" : "s"}`,
        );
      }
      await load();
      const uniq = [...new Set(newUrls)];
      if (onPickMultiple) onPickMultiple(uniq);
      else uniq.forEach((u) => onPick(u));
      onOpenChange(false);
    } catch (err) {
      showToast(withRlsHint(storageUploadErrorMessage(err)), "error");
    } finally {
      setUploading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        aria-label="Close"
        onClick={() => !uploading && onOpenChange(false)}
        disabled={uploading}
      />
      <div
        className="relative z-[101] flex max-h-[min(90vh,820px)] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="media-picker-title"
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] px-4 py-3">
          <h2 id="media-picker-title" className="text-sm font-semibold text-white">
            Media library
          </h2>
          <div className="flex items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              className="sr-only"
              accept="image/*,.svg,.webp,.avif,.heic,.heif"
              multiple={mode === "multiple"}
              onChange={(ev) => void onFileInput(ev)}
              disabled={uploading || loading}
            />
            <button
              type="button"
              disabled={uploading || loading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-medium text-white/85 hover:bg-white/[0.1] disabled:opacity-45"
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {mode === "multiple" ? "Upload" : "Upload"}
            </button>
            <button
              type="button"
              onClick={() => !uploading && onOpenChange(false)}
              disabled={uploading}
              className="rounded-lg p-2 text-white/45 hover:bg-white/[0.06] hover:text-white disabled:opacity-45"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_280px]">
          <div className="min-h-[240px] overflow-y-auto border-b border-white/[0.06] p-3 md:border-b-0 md:border-r">
            {loading ? (
              <div className="flex h-48 items-center justify-center gap-2 text-sm text-white/45">
                <Loader2 className="h-5 w-5 animate-spin" />
                Loading…
              </div>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-sm text-white/40">
                No files yet. Upload with the button above or from the main media page.
              </p>
            ) : (
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {items.map((item) => {
                  const img = isProbablyImage(item);
                  const key = itemKey(item);
                  const isSel =
                    mode === "single"
                      ? selected?.path === item.path && selected?.bucket === item.bucket
                      : multiSelected.has(key);
                  return (
                    <li key={`${item.bucket}:${item.path}`}>
                      <button
                        type="button"
                        onClick={() => {
                          if (mode === "multiple") {
                            if (!isProbablyImage(item)) {
                              showToast("Only images can be added", "error");
                              return;
                            }
                            setMultiSelected((prev) => {
                              const next = new Set(prev);
                              if (next.has(key)) next.delete(key);
                              else next.add(key);
                              return next;
                            });
                            return;
                          }
                          setSelected(item);
                        }}
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
            {mode === "multiple" ? (
              <>
                <p className="text-[11px] text-white/40">
                  Upload adds to this field&apos;s folder, or select existing images. Non-image files are skipped when
                  adding.
                </p>
                <p className="text-sm text-white/75">{multiSelected.size} selected</p>
                <button
                  type="button"
                  onClick={() => setMultiSelected(new Set())}
                  className="rounded-lg border border-white/12 py-2 text-xs font-medium text-white/60 hover:bg-white/[0.06] hover:text-white/90"
                >
                  Clear selection
                </button>
                <button
                  type="button"
                  disabled={multiSelected.size === 0}
                  onClick={() => {
                    const urls = items
                      .filter((it) => multiSelected.has(itemKey(it)) && isProbablyImage(it))
                      .map((it) => it.publicUrl);
                    const uniq = [...new Set(urls)];
                    if (onPickMultiple) onPickMultiple(uniq);
                    else uniq.forEach((u) => onPick(u));
                    onOpenChange(false);
                  }}
                  className="mt-auto rounded-lg bg-white py-2.5 text-xs font-semibold text-black hover:bg-white/90 disabled:opacity-40"
                >
                  Add {multiSelected.size} image{multiSelected.size === 1 ? "" : "s"}
                </button>
              </>
            ) : (
              <>
                <p className="text-[11px] text-white/40">
                  Select an image below, or upload. New files use the same storage as this field.
                </p>
                {selected ? (
                  <>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                        Title
                      </label>
                      <Input className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                        Alt text
                      </label>
                      <Input className={field} value={alt} onChange={(e) => setAlt(e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-white/40">
                        Caption
                      </label>
                      <Textarea
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
