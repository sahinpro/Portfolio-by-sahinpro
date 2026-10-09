import { isPublicFileReachable } from "@/lib/publicFileReachable";
import { supabase } from "@/utils/supabase";

export const RESUME_STORAGE_BUCKET = "documents";
export const RESUME_STORAGE_PREFIX = "cv";

export type StoredResumeFile = {
  file_url: string;
  file_name: string;
  storagePath: string;
};

/** Newest object in the CV folder that is publicly downloadable. */
export async function latestStoredResume(): Promise<StoredResumeFile | null> {
  const { data, error } = await supabase.storage
    .from(RESUME_STORAGE_BUCKET)
    .list(RESUME_STORAGE_PREFIX, {
      limit: 100,
      sortBy: { column: "updated_at", order: "desc" },
    });
  if (error) return null;

  const file = (data ?? []).find(
    (o) => o.id !== null && typeof o.name === "string" && o.name.length > 0,
  );
  if (!file) return null;

  const storagePath = `${RESUME_STORAGE_PREFIX}/${file.name}`;
  const { data: urlData } = supabase.storage
    .from(RESUME_STORAGE_BUCKET)
    .getPublicUrl(storagePath);
  const file_url = urlData.publicUrl;
  if (!file_url || !(await isPublicFileReachable(file_url))) return null;

  return { file_url, file_name: file.name, storagePath };
}
