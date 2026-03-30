import { supabase } from "@/utils/supabase";

export async function uploadPublicFile(
  bucket: string,
  path: string,
  file: File,
  metadata?: Record<string, string>,
): Promise<string> {
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    upsert: true,
    cacheControl: "3600",
    ...(metadata && Object.keys(metadata).length ? { metadata } : {}),
  });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}
