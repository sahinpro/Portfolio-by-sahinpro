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
};

export const MEDIA_BUCKETS: { id: MediaBucketId; label: string; hint: string }[] = [
  { id: "portfolio-assets", label: "Portfolio", hint: "Projects, SEO, testimonials, social" },
  { id: "blog-media", label: "Blog", hint: "Post covers and inline images" },
];

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
      const meta = item.metadata;
      out.push({
        bucket,
        path,
        name: item.name,
        updatedAt: item.updated_at,
        size: meta?.size ?? null,
        mimeType: meta?.mimetype ?? null,
        publicUrl: getMediaPublicUrl(bucket, path),
      });
    }
  }
}

export async function listAllMediaInBucket(bucket: MediaBucketId): Promise<MediaLibraryItem[]> {
  const out: MediaLibraryItem[] = [];
  await walkBucket(bucket, "", out);
  return out;
}

export async function deleteMediaObject(bucket: MediaBucketId, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}
