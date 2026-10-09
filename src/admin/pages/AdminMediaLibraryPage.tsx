"use client";

import {
  acknowledgeDuplicateUploads,
  useDuplicateUploadConfirm,
} from "@/admin/context/DuplicateUploadConfirmContext";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { formatBytes } from "@/admin/lib/formatBytes";
import { isLikelyImageFile } from "@/admin/lib/imageFileAccept";
import {
  type MediaLibraryItem,
  deleteMediaObject,
  libraryItemFromUpload,
  listAllMediaMerged,
  updateMediaItemMetadata,
} from "@/admin/lib/listMediaFiles";
import {
  storageUploadErrorMessage,
  uploadPublicFileContentAddressed,
} from "@/admin/lib/storageUpload";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

function isProbablyImage(item: MediaLibraryItem): boolean {
  const m = item.mimeType?.toLowerCase() ?? "";
  if (m.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif|heic|heif|ico)$/i.test(item.name);
}

/** File extension badge + optional MIME snippet for the card footer */
function getMediaFormat(item: MediaLibraryItem): {
  ext: string;
  mimeShort: string | null;
} {
  const mime = item.mimeType?.toLowerCase().trim() ?? "";
  const fromName = item.name.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  let ext = fromName?.toUpperCase() ?? "";
  if (ext === "JPEG" || ext === "JPG") ext = "JPG";

  if (!ext && mime) {
    if (mime === "image/jpeg") ext = "JPG";
    else if (mime === "image/svg+xml") ext = "SVG";
    else if (mime.startsWith("image/")) {
      const sub = mime.slice("image/".length);
      ext =
        sub.replace("+xml", "").split("+")[0]?.toUpperCase().slice(0, 10) ||
        "IMG";
    } else {
      const parts = mime.split("/");
      ext = (parts[1] ?? parts[0] ?? "FILE").toUpperCase().slice(0, 10);
    }
  }
  if (!ext) ext = "FILE";

  const mimeShort =
    mime.length === 0
      ? null
      : mime.length > 42
        ? `${mime.slice(0, 39)}…`
        : mime;

  return { ext, mimeShort };
}

const DEFAULT_UPLOAD_BUCKET = "portfolio-assets" as const;

export function AdminMediaLibraryPage(): JSX.Element {
  const { showToast } = useToast();
  const { openPrompt } = useDuplicateUploadConfirm();
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<MediaLibraryItem | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaAlt, setMetaAlt] = useState("");
  const [metaCaption, setMetaCaption] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);

  const load = useCallback(async (): Promise<MediaLibraryItem[]> => {
    setLoading(true);
    try {
      const list = await listAllMediaMerged();
      setItems(list);
      return list;
    } catch (e) {
      showToast(
        withRlsHint(e instanceof Error ? e.message : "Could not load files"),
        "error",
      );
      setItems([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!selected) {
      setMetaTitle("");
      setMetaAlt("");
      setMetaCaption("");
      setEditorOpen(false);
      return;
    }
    setMetaTitle(selected.title ?? "");
    setMetaAlt(selected.alt ?? "");
    setMetaCaption(selected.caption ?? "");
  }, [selected]);

  useEffect(() => {
    if (!editorOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setEditorOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [editorOpen]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.bucket.toLowerCase().includes(q) ||
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
    const input = e.target;
    const picked = Array.from(input.files ?? []);
    input.value = "";
    if (picked.length === 0) return;

    const list = picked.filter((f) => isLikelyImageFile(f));
    if (list.length === 0) {
      showToast("Add image files only", "error");
      return;
    }

    setUploading(true);
    try {
      let newCount = 0;
      let reusedCount = 0;
      const fresh: {
        file: File;
        storagePath: string;
        publicUrl: string;
        title: string;
      }[] = [];
      for (const file of list) {
        const baseTitle = file.name
          .replace(/\.[^.]+$/, "")
          .replace(/[-_]+/g, " ");
        const { publicUrl, skippedUpload, storagePath } =
          await uploadPublicFileContentAddressed(
            DEFAULT_UPLOAD_BUCKET,
            "library",
            file,
            {
              title: baseTitle,
            },
          );
        if (skippedUpload) reusedCount += 1;
        else {
          newCount += 1;
          fresh.push({ file, storagePath, publicUrl, title: baseTitle });
        }
      }

      let merged = await load();
      for (const u of fresh) {
        const exists = merged.some(
          (x) => x.bucket === DEFAULT_UPLOAD_BUCKET && x.path === u.storagePath,
        );
        if (!exists) {
          merged = [
            libraryItemFromUpload({
              bucket: DEFAULT_UPLOAD_BUCKET,
              storagePath: u.storagePath,
              file: u.file,
              publicUrl: u.publicUrl,
              title: u.title,
            }),
            ...merged,
          ];
        }
      }
      setItems(merged);

      if (reusedCount > 0) {
        await acknowledgeDuplicateUploads(openPrompt, reusedCount, newCount);
      } else if (newCount > 0) {
        showToast(
          list.length === 1 ? "Uploaded" : `${list.length} files uploaded`,
        );
      }
    } catch (err) {
      showToast(withRlsHint(storageUploadErrorMessage(err)), "error");
    } finally {
      setUploading(false);
    }
  };

  const saveSelectedMeta = async () => {
    if (!selected) return;
    setSavingMeta(true);
    try {
      await updateMediaItemMetadata(selected, {
        title: metaTitle,
        alt: metaAlt,
        caption: metaCaption,
      });
      showToast("Details saved");
      const list = await listAllMediaMerged();
      setItems(list);
      const next = list.find((x) => x.path === selected.path);
      if (next) setSelected(next);
    } catch (err) {
      showToast(
        withRlsHint(err instanceof Error ? err.message : "Save failed"),
        "error",
      );
    } finally {
      setSavingMeta(false);
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
      setItems((prev) =>
        prev.filter((x) => !(x.bucket === item.bucket && x.path === item.path)),
      );
      setSelected((s) =>
        s?.path === item.path && s.bucket === item.bucket ? null : s,
      );
    } catch (err) {
      showToast(
        withRlsHint(err instanceof Error ? err.message : "Delete failed"),
        "error",
      );
    }
  };

  return (
    <div className="max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Media library
          </h1>
          <p className="text-sm text-white/45 mt-2 max-w-xl leading-relaxed">
            One library for all site images: portfolio uploads and
            anything you attach in forms. Files live in Supabase Storage (two
            buckets shown together here).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/*
            Use a real <label> + visually hidden file input. Browsers often block programmatic
            .click() on inputs with display:none, which broke the old "Upload" button.
          */}
          <label
            title="Select one or more files"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              // outline button variant sets [&_svg]:pointer-events-none; on a <label> that lets clicks
              // fall through the icon so the file dialog never opens unless you hit the text.
              "[&_svg]:pointer-events-auto",
              "h-9 cursor-pointer border-white/12 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white shadow-none",
              (uploading || loading) && "pointer-events-none opacity-50",
            )}
          >
            <input
              type="file"
              className="sr-only"
              accept="image/*,.svg,.webp,.avif,.heic,.heif"
              multiple
              onChange={onUpload}
            />
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload
          </label>
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
            ? "No files yet. Upload an image to get started."
            : "No files match your search."}
        </div>
      ) : (
        <div
          className="min-h-0 max-h-[min(72vh,680px)] overflow-y-auto overscroll-contain pr-1
            [scrollbar-gutter:stable]"
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filtered.map((item) => {
              const img = isProbablyImage(item);
              const isSel =
                selected?.path === item.path &&
                selected?.bucket === item.bucket;
              const { ext, mimeShort } = getMediaFormat(item);
              return (
                <li
                  key={`${item.bucket}:${item.path}`}
                  className={cn(
                    "group rounded-xl border bg-zinc-900/30 overflow-hidden cursor-pointer",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition-colors",
                    isSel
                      ? "border-white/35 ring-2 ring-white/15"
                      : "border-white/[0.08] hover:border-white/[0.12]",
                  )}
                  onClick={() => {
                    setSelected(item);
                    setEditorOpen(true);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(item);
                      setEditorOpen(true);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="aspect-[4/3] bg-black/40 flex items-center justify-center relative">
                    <span
                      className="absolute left-2 top-2 z-[1] rounded-md border border-white/15 bg-black/70 px-1.5 py-0.5
                          text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm"
                      title={item.mimeType ?? ext}
                    >
                      {ext}
                    </span>
                    {img ? (
                      <img
                        src={item.publicUrl}
                        alt=""
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-center px-2">
                        <FileQuestion className="w-12 h-12 text-white/20" />
                        <span className="text-[10px] font-medium uppercase text-white/35">
                          {ext}
                        </span>
                      </div>
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
                        onClick={(e) => {
                          e.stopPropagation();
                          void copyUrl(item.publicUrl);
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                  <div className="p-3 border-t border-white/[0.06]">
                    <p
                      className="text-xs font-medium text-white truncate"
                      title={item.path}
                    >
                      {item.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className="inline-flex rounded border border-white/10 bg-white/[0.06] px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-white/55">
                        {ext}
                      </span>
                      {mimeShort ? (
                        <span
                          className="text-[9px] text-white/30 truncate max-w-[140px]"
                          title={item.mimeType ?? undefined}
                        >
                          {mimeShort}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className="text-[10px] text-white/35 truncate mt-1 font-mono"
                      title={item.path}
                    >
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
                          onClick={(e) => {
                            e.stopPropagation();
                            void copyUrl(item.publicUrl);
                          }}
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
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-md text-white/45 hover:text-white hover:bg-white/[0.08]
                              transition-colors"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                        <button
                          type="button"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            void onDelete(item);
                          }}
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
        </div>
      )}

      {editorOpen && selected ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6">
          <button
            type="button"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            aria-label="Close editor"
            onClick={() => setEditorOpen(false)}
          />
          <div
            className="relative z-[101] flex max-h-[min(92vh,880px)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/[0.1] bg-zinc-950 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="media-editor-title"
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <h2
                  id="media-editor-title"
                  className="truncate text-sm font-semibold text-white sm:text-base"
                >
                  Edit attachment
                </h2>
                <p
                  className="mt-0.5 truncate text-xs text-white/45"
                  title={selected.name}
                >
                  {selected.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditorOpen(false)}
                className="shrink-0 rounded-lg p-2 text-white/45 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[minmax(0,1.15fr)_minmax(280px,1fr)]">
              <div className="flex min-h-[220px] flex-col border-b border-white/[0.06] bg-gradient-to-b from-zinc-900/50 to-black/40 md:min-h-0 md:border-b-0 md:border-r">
                <div className="flex flex-1 items-center justify-center p-4 sm:p-6">
                  {isProbablyImage(selected) ? (
                    <div className="relative max-h-[min(52vh,520px)] w-full max-w-full overflow-hidden rounded-xl border border-white/[0.08] bg-black/50 shadow-inner">
                      <img
                        src={selected.publicUrl}
                        alt={metaAlt || selected.name}
                        className="mx-auto max-h-[min(52vh,520px)] w-auto max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex w-full max-w-md flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-6 py-16 text-center">
                      <FileQuestion className="h-14 w-14 text-white/25" />
                      <p className="text-xs text-white/45">
                        No image preview for this file type.
                      </p>
                      <a
                        href={selected.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-300/90 hover:text-violet-200"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open in new tab
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex min-h-0 flex-col gap-0 overflow-y-auto overscroll-contain [scrollbar-gutter:stable]">
                <div className="space-y-4 p-4 sm:p-5">
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/35">
                      File
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex rounded-md border border-white/12 bg-white/[0.06] px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white/85">
                        {getMediaFormat(selected).ext}
                      </span>
                      {selected.mimeType ? (
                        <span
                          className="text-[10px] text-white/45 break-all"
                          title={selected.mimeType}
                        >
                          {selected.mimeType}
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/35">
                          MIME unknown
                        </span>
                      )}
                      <span className="text-[10px] tabular-nums text-white/40">
                        {formatBytes(selected.size)}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-[10px] leading-relaxed text-white/40 break-all">
                      {selected.path}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] font-medium text-white/90">
                      Metadata
                    </p>
                    <p className="mt-0.5 text-[10px] text-white/35">
                      Used for accessibility and rich captions across the site.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label
                        htmlFor="media-meta-title"
                        className="text-[10px] font-medium uppercase tracking-wide text-white/50"
                      >
                        Title
                      </label>
                      <Input
                        id="media-meta-title"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        className="mt-1.5 h-10 border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25"
                        placeholder="Descriptive title"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="media-meta-alt"
                        className="text-[10px] font-medium uppercase tracking-wide text-white/50"
                      >
                        Alt text
                      </label>
                      <Input
                        id="media-meta-alt"
                        value={metaAlt}
                        onChange={(e) => setMetaAlt(e.target.value)}
                        className="mt-1.5 h-10 border-white/10 bg-white/[0.05] text-white text-sm placeholder:text-white/25"
                        placeholder="Describe the image for screen readers"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="media-meta-caption"
                        className="text-[10px] font-medium uppercase tracking-wide text-white/50"
                      >
                        Caption
                      </label>
                      <Textarea
                        id="media-meta-caption"
                        value={metaCaption}
                        onChange={(e) => setMetaCaption(e.target.value)}
                        rows={4}
                        className="mt-1.5 w-full resize-none border-white/10 bg-white/[0.05] text-sm text-white placeholder:text-white/25 focus-visible:ring-2 focus-visible:ring-white/15"
                        placeholder="Optional caption shown with the image"
                      />
                    </div>
                  </div>

                  <Separator className="bg-white/[0.08]" />

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button
                      type="button"
                      size="sm"
                      disabled={savingMeta}
                      onClick={() => void saveSelectedMeta()}
                      className="h-10 flex-1 bg-white text-black hover:bg-white/90 sm:min-w-[140px]"
                    >
                      {savingMeta ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Save details"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 flex-1 border-white/15 text-white hover:bg-white/[0.06] sm:min-w-[120px]"
                      onClick={() => void copyUrl(selected.publicUrl)}
                    >
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy URL
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 flex-1 border-white/15 text-white hover:bg-white/[0.06] sm:min-w-[120px]"
                      asChild
                    >
                      <a
                        href={selected.publicUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Open file
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <p className="mt-10 text-xs text-white/30 flex items-start gap-2">
        <FileImage className="h-4 w-4 shrink-0 mt-0.5 opacity-60" />
        <span>
          Form uploads (projects, etc.) appear here automatically. Uploads
          from this page go to{" "}
          <code className="text-white/50">portfolio-assets/library/</code> for a
          predictable path; field uploads keep their own folders (
          <code className="text-white/50">projects/</code>, …).
        </span>
      </p>
    </div>
  );
}
