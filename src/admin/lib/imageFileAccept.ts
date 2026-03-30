/** Some OS/browsers leave `File.type` empty; still treat as image by extension. */
export function isLikelyImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  return /\.(png|jpe?g|gif|webp|svg|avif|ico|bmp|heic|heif)$/i.test(file.name);
}

/** Supabase buckets may restrict MIME types — set contentType when the browser omits it. */
export function guessImageMimeFromName(fileName: string): string | undefined {
  const ext = fileName.split(".").pop()?.toLowerCase();
  if (!ext) return undefined;
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    avif: "image/avif",
    ico: "image/x-icon",
    bmp: "image/bmp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return map[ext];
}
