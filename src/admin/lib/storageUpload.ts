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
