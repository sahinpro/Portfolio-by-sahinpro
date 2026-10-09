import { MediaLibraryPickerModal } from "@/admin/components/MediaLibraryPickerModal";
import {
  promptBatchDuplicateFiles,
  useDuplicateUploadConfirm,
} from "@/admin/context/DuplicateUploadConfirmContext";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { isLikelyImageFile } from "@/admin/lib/imageFileAccept";
import {
  storageUploadErrorMessage,
  uploadPublicFileContentAddressed,
} from "@/admin/lib/storageUpload";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImagePlus,
  Images,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

type BucketId = "portfolio-assets";

type ImageGalleryFieldProps = {
  label?: string;
  value: string[];
  onChange: (urls: string[]) => void;
  bucket: BucketId;
  pathPrefix: string;
};

function mergeUnique(existing: string[], additions: string[]): string[] {
  const seen = new Set(existing.map((u) => u.trim()).filter(Boolean));
  const out = [...existing];
  for (const a of additions) {
    const t = a.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function ImageGalleryField({
  label = "Screenshot gallery",
  value,
  onChange,
  bucket,
  pathPrefix,
}: ImageGalleryFieldProps): JSX.Element {
  const { showToast } = useToast();
  const { openPrompt } = useDuplicateUploadConfirm();
  const fileInputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    const onWindowFocus = () => {
      // Native file dialog cancel can leave visual hover/drag state stale in some browsers.
      setDragOver(false);
    };
    window.addEventListener("focus", onWindowFocus);
    return () => window.removeEventListener("focus", onWindowFocus);
  }, []);

  const runUploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((f) => isLikelyImageFile(f));
      if (list.length === 0) {
        showToast("Add image files only", "error");
        return;
      }
      setUploading(true);
      const newUrls: string[] = [];
      let skipped = 0;
      try {
        const prefix = pathPrefix.replace(/^\/+|\/+$/g, "");
        for (const file of list) {
          const baseTitle = file.name
            .replace(/\.[^.]+$/, "")
            .replace(/[-_]+/g, " ");
          const { publicUrl, skippedUpload } =
            await uploadPublicFileContentAddressed(bucket, prefix, file, {
              title: baseTitle,
            });
          newUrls.push(publicUrl);
          if (skippedUpload) skipped += 1;
        }
        const newCount = list.length - skipped;
        if (skipped > 0) {
          const proceed = await promptBatchDuplicateFiles(
            openPrompt,
            newCount,
            skipped,
          );
          if (!proceed) return;
        }
        onChange(mergeUnique(value, newUrls));
        if (skipped === 0) {
          showToast(
            list.length === 1
              ? "Image uploaded"
              : `${list.length} images uploaded`,
          );
        } else {
          showToast(
            newCount > 0
              ? `Added ${newCount} new image${newCount === 1 ? "" : "s"} (${skipped} existing reused)`
              : `Added ${skipped} image${skipped === 1 ? "" : "s"} from storage`,
          );
        }
      } catch (err) {
        showToast(withRlsHint(storageUploadErrorMessage(err)), "error");
      } finally {
        setUploading(false);
      }
    },
    [bucket, onChange, openPrompt, pathPrefix, showToast, value],
  );

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    setDragOver(false);
    if (files.length === 0) return;
    await runUploadFiles(files);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (!files?.length) return;
    await runUploadFiles(files);
  };

  const removeAt = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const openFileDialog = () => {
    setDragOver(false);
    fileRef.current?.click();
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= value.length) return;
    const copy = [...value];
    const t = copy[index]!;
    copy[index] = copy[next]!;
    copy[next] = t;
    onChange(copy);
  };

  return (
    <div>
      {label ? <label className={labelCls}>{label}</label> : null}
      <p className="text-[11px] text-white/35 mb-3">
        Upload several images, pick many from the media library, or paste URLs
        below. Order is shown on the public project page.
      </p>

      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept="image/*,.svg,.webp,.avif,.heic,.heif"
        multiple
        className="sr-only"
        onChange={onFileInput}
        disabled={uploading}
      />

      <div className="space-y-3">
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            "rounded-xl border border-dashed transition-colors",
            dragOver
              ? "border-white/35 bg-white/[0.08]"
              : "border-white/[0.14] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <button
            type="button"
            onClick={openFileDialog}
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-2 px-4 py-8",
              uploading && "cursor-not-allowed",
            )}
            disabled={uploading}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.06] text-white/55">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">
                {uploading
                  ? "Uploading…"
                  : "Drop images here or click to upload (multiple)"}
              </p>
              <p className="mt-1 text-xs text-white/35">
                PNG, JPG, WebP, SVG multiple files allowed
              </p>
            </div>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.08] hover:text-white"
          >
            <Images className="h-3.5 w-3.5" />
            Media library (multi-select)
          </button>
        </div>

        {value.length > 0 ? (
          <ul className="space-y-2">
            {value.map((url, index) => (
              <li
                key={`${url}-${index}`}
                className="flex gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2"
              >
                <div className="flex shrink-0 flex-col items-center justify-center gap-0.5 text-white/30">
                  <GripVertical className="h-4 w-4 opacity-50" />
                </div>
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/[0.08] bg-black/30">
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <Input
                  className={cn(field, "min-w-0 flex-1 text-xs h-8")}
                  value={url}
                  onChange={(e) => {
                    const next = [...value];
                    next[index] = e.target.value;
                    onChange(next);
                  }}
                  placeholder="Image URL"
                />
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="rounded border border-white/10 p-1 text-white/50 hover:bg-white/[0.06] disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === value.length - 1}
                    className="rounded border border-white/10 p-1 text-white/50 hover:bg-white/[0.06] disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeAt(index)}
                    className="rounded border border-red-500/20 p-1 text-red-400/90 hover:bg-red-500/10"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-white/30">No screenshots yet.</p>
        )}
      </div>

      <MediaLibraryPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        uploadBucket={bucket}
        pathPrefix={pathPrefix}
        mode="multiple"
        onPick={() => {}}
        onPickMultiple={(urls) => onChange(mergeUnique(value, urls))}
      />
    </div>
  );
}
