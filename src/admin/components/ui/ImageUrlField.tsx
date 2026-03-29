import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { uploadPublicFile } from "@/admin/lib/storageUpload";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";

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

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/\s+/g, "-");
      const path = `${pathPrefix.replace(/^\/+|\/+$/g, "")}/${crypto.randomUUID()}-${safe}`;
      const url = await uploadPublicFile(bucket, path, file);
      onChange(url);
      showToast("Image uploaded");
    } catch (err) {
      showToast(withRlsHint(err instanceof Error ? err.message : "Upload failed"), "error");
    } finally {
      setUploading(false);
    }
  };

  if (variant === "compact") {
    return (
      <div className="flex items-center gap-1.5 min-w-0">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
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
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onUpload}
          disabled={uploading}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/[0.06] disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload image"}
        </button>
        <Link
          to={`/admin/media?b=${bucket}`}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/55
            hover:bg-white/[0.06] hover:text-white/85 transition-colors"
        >
          Media library
        </Link>
        {value ? (
          <img
            src={value}
            alt=""
            className="h-16 w-28 rounded object-cover border border-white/10"
          />
        ) : null}
        <input
          className={`${field} min-w-[200px] flex-1`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
