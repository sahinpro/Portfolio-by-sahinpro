import { guessImageMimeFromName } from "@/admin/lib/imageFileAccept";
import { isPublicFileReachable } from "@/lib/publicFileReachable";
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

function fileExtension(fileName: string): string {
  const ext = fileName.match(/\.([a-zA-Z0-9]+)$/)?.[1];
  return ext ? `.${ext.toLowerCase()}` : "";
}

export type ContentAddressedUploadResult = {
  publicUrl: string;
  /** Storage object path (no bucket), e.g. `library/abc…`. */
  storagePath: string;
  /** True when bytes were already stored at this path (no new upload). */
  skippedUpload: boolean;
};

/**
 * Uploads `file` to `{pathPrefix}/{sha256}` so identical bytes always map to one object.
 * Pass `keepExtension` for documents (e.g. `.pdf`) so browsers treat the public URL as a file.
 * Skip is based on a public Range GET, not storage list (list can be stale after deletes).
 */
export async function uploadPublicFileContentAddressed(
  bucket: string,
  pathPrefix: string,
  file: File,
  metadata?: Record<string, string>,
  options?: { keepExtension?: boolean },
): Promise<ContentAddressedUploadResult> {
  const prefix = normalizeStoragePrefix(pathPrefix);
  if (!prefix) throw new Error("Storage path prefix is required");

  const buf = await file.arrayBuffer();
  const hash = await sha256Hex(buf);
  const ext = options?.keepExtension ? fileExtension(file.name) : "";
  const path = `${prefix}/${hash}${ext}`;
  const contentType = resolveContentType(file) || "application/octet-stream";

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  if (await isPublicFileReachable(publicUrl)) {
    return { publicUrl, storagePath: path, skippedUpload: true };
  }

  const blob = new Blob([buf], { type: contentType });
  const { error } = await supabase.storage.from(bucket).upload(path, blob, {
    upsert: true,
    cacheControl: "3600",
    contentType,
    ...(metadata && Object.keys(metadata).length ? { metadata } : {}),
  });
  if (error) throw error;
  return { publicUrl, storagePath: path, skippedUpload: false };
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
