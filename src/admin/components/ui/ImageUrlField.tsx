import { MediaLibraryPickerModal } from "@/admin/components/MediaLibraryPickerModal";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { uploadPublicFile } from "@/admin/lib/storageUpload";
import { cn } from "@/lib/utils";
import { ImagePlus, Images } from "lucide-react";
import { useCallback, useRef, useState } from "react";

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
};

export function ImageUrlField({
  label,
  value,
  onChange,
  bucket,
  pathPrefix,
  placeholder = "Or paste image URL",
  variant = "default",
}: ImageUrlFieldProps): JSX.Element {
  const { showToast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  const runUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const safe = file.name.replace(/\s+/g, "-");
        const path = `${pathPrefix.replace(/^\/+|\/+$/g, "")}/${crypto.randomUUID()}-${safe}`;
        const baseTitle = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
        const url = await uploadPublicFile(bucket, path, file, {
          title: baseTitle,
        });
        onChange(url);
        showToast("Image uploaded");
      } catch (err) {
        showToast(withRlsHint(err instanceof Error ? err.message : "Upload failed"), "error");
      } finally {
        setUploading(false);
      }
    },
    [bucket, onChange, pathPrefix, showToast],
  );

  const onFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    await runUpload(file);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      showToast("Drop an image file", "error");
      return;
    }
    await runUpload(file);
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileInput}
          disabled={uploading}
        />
        <input
          className={`${field} flex-1 min-w-[100px] text-xs py-1.5 px-2`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Key or URL"
          title="Lucide icon name or image URL"
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="shrink-0 rounded border border-white/15 px-2 py-1 text-[10px] font-medium text-white/75 hover:bg-white/[0.06] disabled:opacity-50"
        >
          {uploading ? "…" : "Up"}
        </button>
        {/^https?:\/\//i.test(value) ? (
          <img src={value} alt="" className="h-6 w-6 rounded object-cover border border-white/10 shrink-0" />
        ) : null}
      </div>
    );
  }

  return (
    <div>
      {label ? <label className={labelCls}>{label}</label> : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileInput}
        disabled={uploading}
      />

      <div className="space-y-3">
        <button
          type="button"
          disabled={uploading}
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
          onClick={() => fileRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-10 transition-colors",
            dragOver
              ? "border-white/35 bg-white/[0.08]"
              : "border-white/[0.14] bg-white/[0.02] hover:border-white/25 hover:bg-white/[0.04]",
            uploading && "pointer-events-none opacity-60",
          )}
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06] text-white/55">
            <ImagePlus className="h-5 w-5" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-white/80">
              {uploading ? "Uploading…" : "Drop an image here or click to upload"}
            </p>
            <p className="mt-1 text-xs text-white/35">PNG, JPG, WebP, SVG — full width drop zone</p>
          </div>
        </button>

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="shrink-0 overflow-hidden rounded-xl border border-white/[0.1] bg-black/30">
              <img src={value} alt="" className="max-h-40 w-full max-w-[280px] object-contain sm:h-36 sm:w-auto" />
            </div>
            <div className="min-w-0 flex-1 space-y-1.5">
              <label className="text-[10px] font-medium uppercase tracking-wide text-white/40">Public URL</label>
              <input
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
            <input
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
        bucket={bucket}
        onPick={onChange}
      />
    </div>
  );
}
