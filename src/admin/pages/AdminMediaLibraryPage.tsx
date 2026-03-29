import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { formatBytes } from "@/admin/lib/formatBytes";
import {
  type MediaBucketId,
  type MediaLibraryItem,
  MEDIA_BUCKETS,
  deleteMediaObject,
  listAllMediaInBucket,
} from "@/admin/lib/listMediaFiles";
import { uploadPublicFile } from "@/admin/lib/storageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Copy,
  ExternalLink,
  FileImage,
  FileQuestion,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

function isProbablyImage(item: MediaLibraryItem): boolean {
  const m = item.mimeType?.toLowerCase() ?? "";
  if (m.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif|ico)$/i.test(item.name);
}

export function AdminMediaLibraryPage(): JSX.Element {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const initialBucket = (searchParams.get("b") || searchParams.get("bucket")) as MediaBucketId | null;
  const [bucket, setBucket] = useState<MediaBucketId>(
    initialBucket === "blog-media" || initialBucket === "portfolio-assets"
      ? initialBucket
      : "portfolio-assets",
  );

  useEffect(() => {
    const b = (searchParams.get("b") || searchParams.get("bucket")) as MediaBucketId | null;
    if (b === "blog-media" || b === "portfolio-assets") {
      setBucket(b);
    }
  }, [searchParams]);
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listAllMediaInBucket(bucket);
      setItems(list);
    } catch (e) {
      showToast(withRlsHint(e instanceof Error ? e.message : "Could not load files"), "error");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [bucket, showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.name.toLowerCase().includes(q) ||
        it.path.toLowerCase().includes(q) ||
        it.publicUrl.toLowerCase().includes(q),
    );
  }, [items, query]);

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast("URL copied");
    } catch {
      showToast("Could not copy", "error");
    }
  };

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const safe = file.name.replace(/\s+/g, "-");
      const path = `library/${crypto.randomUUID()}-${safe}`;
      const url = await uploadPublicFile(bucket, path, file);
      showToast("Uploaded");
      await load();
      void copyUrl(url);
    } catch (err) {
      showToast(withRlsHint(err instanceof Error ? err.message : "Upload failed"), "error");
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (item: MediaLibraryItem) => {
    if (
      !window.confirm(
        `Delete “${item.name}” from storage? Links using this URL will break.`,
      )
    ) {
      return;
    }
    try {
      await deleteMediaObject(item.bucket, item.path);
      showToast("Deleted");
      setItems((prev) => prev.filter((x) => !(x.bucket === item.bucket && x.path === item.path)));
    } catch (err) {
      showToast(withRlsHint(err instanceof Error ? err.message : "Delete failed"), "error");
    }
  };

  const bucketMeta = MEDIA_BUCKETS.find((b) => b.id === bucket);

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">Media library</h1>
          <p className="text-sm text-white/45 mt-2 max-w-xl leading-relaxed">
            Upload once, copy public URLs anywhere in the admin (projects, blog, SEO, testimonials).
            Files live in Supabase Storage — same buckets as image fields.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="image/*,.svg,.webp,.avif"
            onChange={onUpload}
            disabled={uploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading || loading}
            onClick={() => fileRef.current?.click()}
            className="h-9 border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white
              shadow-none"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => void load()}
            className="h-9 border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white
              shadow-none"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-white/[0.08] bg-zinc-950/40 p-1 mb-6 inline-flex">
        {MEDIA_BUCKETS.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setBucket(b.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              bucket === b.id
                ? "bg-white/10 text-white shadow-sm border border-white/[0.06]"
                : "text-white/45 hover:text-white/75 hover:bg-white/[0.04]",
            )}
          >
            {b.label}
          </button>
        ))}
      </div>

      {bucketMeta ? (
        <p className="text-xs text-white/35 mb-6 -mt-2">{bucketMeta.hint}</p>
      ) : null}

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter by file name or path…"
          className="h-10 pl-9 border-white/10 bg-white/[0.04] text-white placeholder:text-white/30
            focus-visible:ring-white/20"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-24 text-white/45 text-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading files…
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] px-6 py-16 text-center
          text-sm text-white/45"
        >
          {items.length === 0
            ? "No files in this bucket yet. Upload an image to get started."
            : "No files match your search."}
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => {
            const img = isProbablyImage(item);
            return (
              <li
                key={`${item.bucket}:${item.path}`}
                className="group rounded-xl border border-white/[0.08] bg-zinc-900/30 overflow-hidden
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:border-white/[0.12]
                  transition-colors"
              >
                <div className="aspect-[4/3] bg-black/40 flex items-center justify-center relative">
                  {img ? (
                    <img
                      src={item.publicUrl}
                      alt=""
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <FileQuestion className="w-12 h-12 text-white/20" />
                  )}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center
                      gap-1.5 p-2"
                  >
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs bg-white/90 text-black hover:bg-white"
                      onClick={() => void copyUrl(item.publicUrl)}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy URL
                    </Button>
                  </div>
                </div>
                <div className="p-3 border-t border-white/[0.06]">
                  <p className="text-xs font-medium text-white truncate" title={item.path}>
                    {item.name}
                  </p>
                  <p className="text-[10px] text-white/35 truncate mt-0.5 font-mono" title={item.path}>
                    {item.path}
                  </p>
                  <div className="flex items-center justify-between mt-2 gap-2">
                    <span className="text-[10px] text-white/40 tabular-nums">
                      {formatBytes(item.size)}
                    </span>
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        title="Copy URL"
                        onClick={() => void copyUrl(item.publicUrl)}
                        className="p-1.5 rounded-md text-white/45 hover:text-white hover:bg-white/[0.08]
                          transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={item.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        title="Open"
                        className="p-1.5 rounded-md text-white/45 hover:text-white hover:bg-white/[0.08]
                          transition-colors"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                      <button
                        type="button"
                        title="Delete"
                        onClick={() => void onDelete(item)}
                        className="p-1.5 rounded-md text-red-400/70 hover:text-red-300 hover:bg-red-500/10
                          transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="mt-10 text-xs text-white/30 flex items-start gap-2">
        <FileImage className="h-4 w-4 shrink-0 mt-0.5 opacity-60" />
        <span>
          Images from project/blog fields also appear here. New uploads use the{" "}
          <code className="text-white/50">library/</code> folder so they are easy to find.
        </span>
      </p>
    </div>
  );
}
