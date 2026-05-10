import { guessImageMimeFromName } from "@/admin/lib/imageFileAccept";
import { supabase } from "@/utils/supabase";
import type { FileObject } from "@supabase/storage-js";

export type MediaBucketId = "portfolio-assets" | "blog-media";

export type MediaLibraryItem = {
  bucket: MediaBucketId;
  path: string;
  name: string;
  updatedAt: string | null;
  size: number | null;
  mimeType: string | null;
  publicUrl: string;
  /** Custom storage metadata (title / alt / caption) when set via upload or library editor */
  title: string | null;
  alt: string | null;
  caption: string | null;
};

export function getMediaPublicUrl(bucket: MediaBucketId, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function walkBucket(
  bucket: MediaBucketId,
  prefix: string,
  out: MediaLibraryItem[],
): Promise<void> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw error;

  for (const item of (data ?? []) as FileObject[]) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      await walkBucket(bucket, path, out);
    } else {
      const meta = item.metadata as Record<string, unknown> | null;
      const str = (k: string): string | null => {
        const v = meta?.[k];
        return typeof v === "string" && v.trim() ? v : null;
      };
      out.push({
        bucket,
        path,
        name: item.name,
        updatedAt: item.updated_at,
        size: (meta?.size as number | undefined) ?? null,
        mimeType: (meta?.mimetype as string | undefined) ?? null,
        publicUrl: getMediaPublicUrl(bucket, path),
        title: str("title"),
        alt: str("alt"),
        caption: str("caption"),
      });
    }
  }
}

export async function listAllMediaInBucket(bucket: MediaBucketId): Promise<MediaLibraryItem[]> {
  const out: MediaLibraryItem[] = [];
  await walkBucket(bucket, "", out);
  return out;
}

/** All public media buckets in one list, newest first. */
export async function listAllMediaMerged(): Promise<MediaLibraryItem[]> {
  const [portfolio, blog] = await Promise.all([
    listAllMediaInBucket("portfolio-assets"),
    listAllMediaInBucket("blog-media"),
  ]);
  const merged = [...portfolio, ...blog];
  merged.sort((x, y) => {
    const tx = x.updatedAt ? Date.parse(x.updatedAt) : 0;
    const ty = y.updatedAt ? Date.parse(y.updatedAt) : 0;
    return ty - tx;
  });
  return merged;
}

export async function deleteMediaObject(bucket: MediaBucketId, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

/**
 * Build a library row when listing may briefly omit a file we just uploaded (storage list lag).
 * Uses the same shape as {@link walkBucket} results.
 */
export function libraryItemFromUpload(args: {
  bucket: MediaBucketId;
  storagePath: string;
  file: File;
  publicUrl: string;
  title?: string | null;
}): MediaLibraryItem {
  const mime =
    args.file.type?.split(";")[0]?.trim() ||
    guessImageMimeFromName(args.file.name) ||
    null;
  const objectName = args.storagePath.includes("/")
    ? args.storagePath.slice(args.storagePath.lastIndexOf("/") + 1)
    : args.storagePath;
  return {
    bucket: args.bucket,
    path: args.storagePath,
    name: objectName,
    updatedAt: new Date().toISOString(),
    size: args.file.size,
    mimeType: mime,
    publicUrl: args.publicUrl,
    title: args.title?.trim() ? args.title.trim() : null,
    alt: null,
    caption: null,
  };
}

/** Re-uploads the same bytes so custom metadata (title, alt, caption) can be updated. */
export async function updateMediaItemMetadata(
  item: MediaLibraryItem,
  fields: { title: string; alt: string; caption: string },
): Promise<void> {
  const { data: blob, error: dlErr } = await supabase.storage.from(item.bucket).download(item.path);
  if (dlErr || !blob) throw dlErr ?? new Error("Could not read file");

  const buf = await blob.arrayBuffer();
  const contentType = item.mimeType || blob.type || "application/octet-stream";

  const { error: upErr } = await supabase.storage.from(item.bucket).update(item.path, buf, {
    upsert: true,
    contentType,
    cacheControl: "3600",
    metadata: {
      title: fields.title.trim() || "",
      alt: fields.alt.trim() || "",
      caption: fields.caption.trim() || "",
    },
  });
  if (upErr) throw upErr;
}
