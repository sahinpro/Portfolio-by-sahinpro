import { MediaLibraryPickerModal } from "@/admin/components/MediaLibraryPickerModal";
import {
  promptSingleDuplicateFile,
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
import { ImagePlus, Images } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

type BucketId = "portfolio-assets" | "blog-media";

type ImageUrlFieldProps = {
  /** Omitted when `variant="compact"`. */
  label?: string;
  value: string;
  onChange: (url: string) => void;
  bucket: BucketId;
  /** Storage path prefix (no leading/trailing slash), e.g. `projects`, `blog`, `testimonials`. */
  pathPrefix: string;
  placeholder?: string;
  /** Narrow layout for table cells (no label). */
  variant?: "default" | "compact";
  /** Shows validation error styling on the upload zone. */
  invalid?: boolean;
};

export function ImageUrlField({
  label,
  value,
  onChange,
  bucket,
  pathPrefix,
  placeholder = "Or paste image URL",
  variant = "default",
  invalid = false,
}: ImageUrlFieldProps): JSX.Element {
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

  const runUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const prefix = pathPrefix.replace(/^\/+|\/+$/g, "");
        const baseTitle = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ");
        const { publicUrl, skippedUpload } =
          await uploadPublicFileContentAddressed(bucket, prefix, file, {
            title: baseTitle,
          });
        if (skippedUpload) {
          const useExisting = await promptSingleDuplicateFile(
            openPrompt,
            file.name,
          );
          if (!useExisting) return;
        }
        onChange(publicUrl);
        showToast(skippedUpload ? "Using existing image" : "Image uploaded");
      } catch (err) {
        showToast(withRlsHint(storageUploadErrorMessage(err)), "error");
      } finally {
        setUploading(false);
      }
    },
    [bucket, onChange, openPrompt, pathPrefix, showToast],
  );

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    setDragOver(false);
    const file = files[0];
    if (!file) return;
    await runUpload(file);
  };
  const openFileDialog = () => {
    setDragOver(false);
    fileRef.current?.click();
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !isLikelyImageFile(file)) {
      showToast("Drop an image file", "error");
      return;
    }
    await runUpload(file);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          id={fileInputId}
          ref={fileRef}
          type="file"
          accept="image/*,.svg,.webp,.avif,.heic,.heif"
          className="sr-only"
          onChange={onFileInput}
          disabled={uploading}
        />
        <Input
          className={`${field} flex-1 min-w-[100px] text-xs py-1.5 px-2 h-8`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Key or URL"
          title="Lucide icon name or image URL"
        />
        <button
          type="button"
          onClick={openFileDialog}
          className={cn(
            "shrink-0 rounded border border-white/15 px-2 py-1 text-[10px] font-medium text-white/75 hover:bg-white/[0.06] cursor-pointer",
            uploading && "opacity-50 pointer-events-none",
          )}
          disabled={uploading}
        >
          {uploading ? "…" : "Up"}
        </button>
        {/^https?:\/\//i.test(value) ? (
          <img
            src={value}
            alt=""
            className="h-6 w-6 rounded object-cover border border-white/10 shrink-0"
          />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {label ? <label className={labelCls}>{label}</label> : null}

      <input
        id={fileInputId}
        ref={fileRef}
        type="file"
        accept="image/*,.svg,.webp,.avif,.heic,.heif"
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
            invalid && !dragOver && "border-red-500/50 bg-red-500/[0.06]",
            dragOver
              ? "border-white/35 bg-white/[0.08]"
              : !invalid &&
                  "border-white/[0.14] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <button
            type="button"
            onClick={openFileDialog}
            className={cn(
              "flex w-full cursor-pointer flex-col items-center justify-center gap-2 px-4 py-10",
              uploading && "cursor-not-allowed",
            )}
            disabled={uploading}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white/55">
              <ImagePlus className="h-5 w-5" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white/80">
                {uploading
                  ? "Uploading…"
                  : "Drop an image here or click to upload"}
              </p>
              <p className="mt-1 text-xs text-white/35">
                PNG, JPG, WebP, SVG full width drop zone
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
            Media library
          </button>
        </div>

        {value ? (
          <div className="flex flex-col gap-3">
            <div className="shrink-0 self-start overflow-hidden rounded-xl border border-white/[0.1] bg-black/30">
              <img
                src={value}
                alt=""
                className="max-h-auto max-w-40 object-contain  sm:w-auto"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wide text-white/40">
                Public URL
              </label>
              <Input
                className={field}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
              />
            </div>
          </div>
        ) : (
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wide text-white/40 mb-1.5 block">
              Public URL
            </label>
            <Input
              className={field}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
            />
          </div>
        )}
      </div>

      <MediaLibraryPickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        uploadBucket={bucket}
        pathPrefix={pathPrefix}
        onPick={onChange}
      />
    </div>
  );
}
