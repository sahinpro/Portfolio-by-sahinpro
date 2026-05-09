import { guessImageMimeFromName } from "@/admin/lib/imageFileAccept";
import { supabase } from "@/utils/supabase";

export function storageUploadErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    const m = (err as { message: unknown }).message;
    if (typeof m === "string") return m;
  }
  return String(err);
}

function normalizeStoragePrefix(prefix: string): string {
  return prefix.replace(/^\/+|\/+$/g, "");
}

const EXT_TO_MIME: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function resolveContentType(file: File): string | undefined {
  if (file.type) return file.type.split(";")[0]!.trim();
  const ext = file.name.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase();
  if (ext && EXT_TO_MIME[ext]) return EXT_TO_MIME[ext];
  return guessImageMimeFromName(file.name);
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  if (!globalThis.crypto?.subtle) {
    throw new Error(
      "Uploads need a secure context (HTTPS or localhost). Open the site with HTTPS and try again.",
    );
  }
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function storageObjectExists(bucket: string, storagePath: string): Promise<boolean> {
  const lastSlash = storagePath.lastIndexOf("/");
  const parent = lastSlash > 0 ? storagePath.slice(0, lastSlash) : "";
  const fileName = lastSlash >= 0 ? storagePath.slice(lastSlash + 1) : storagePath;
  const { data, error } = await supabase.storage.from(bucket).list(parent, {
    limit: 100,
    search: fileName,
  });
  if (error) return false;
  return (data ?? []).some((o) => o.name === fileName);
}

export type ContentAddressedUploadResult = {
  publicUrl: string;
  /** True when bytes were already stored at this path (no new upload). */
  skippedUpload: boolean;
};

/**
 * Uploads `file` to `{pathPrefix}/{sha256}` (no filename extension) so identical bytes always
 * map to one object, regardless of original extension. Content-Type is set from the file.
 * If that object already exists, returns its public URL without uploading again.
 */
export async function uploadPublicFileContentAddressed(
  bucket: string,
  pathPrefix: string,
  file: File,
  metadata?: Record<string, string>,
): Promise<ContentAddressedUploadResult> {
  const prefix = normalizeStoragePrefix(pathPrefix);
  if (!prefix) throw new Error("Storage path prefix is required");

  const buf = await file.arrayBuffer();
  const hash = await sha256Hex(buf);
  const path = `${prefix}/${hash}`;
  const contentType = resolveContentType(file) || "application/octet-stream";

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const exists = await storageObjectExists(bucket, path);
  if (exists) {
    return { publicUrl, skippedUpload: true };
  }

  const blob = new Blob([buf], { type: contentType });
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    cacheControl: "3600",
    contentType,
    ...(metadata && Object.keys(metadata).length ? { metadata } : {}),
  });
  if (error) throw error;
  return { publicUrl, skippedUpload: false };
}

/** Low-level upload when you must control the full path (no deduplication). */
export async function uploadPublicFile(
  bucket: string,
  path: string,
  file: File,
  metadata?: Record<string, string>,
): Promise<string> {
  const contentType = file.type || guessImageMimeFromName(file.name);

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
    ...(contentType ? { contentType } : {}),
    ...(metadata && Object.keys(metadata).length ? { metadata } : {}),
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
