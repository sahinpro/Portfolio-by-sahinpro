/**
 * True when a public storage URL actually serves bytes.
 * Supabase public objects often reject HEAD (400); a 1-byte Range GET is reliable.
 */
export async function isPublicFileReachable(fileUrl: string): Promise<boolean> {
  if (!fileUrl.trim()) return false;
  try {
    const res = await fetch(fileUrl, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
      cache: "no-store",
      redirect: "follow",
    });
    return res.status === 200 || res.status === 206;
  } catch {
    return false;
  }
}
