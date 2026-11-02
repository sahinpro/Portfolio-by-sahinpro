export type ResumeDownloadSource = {
  file_url: string;
  file_name: string | null;
};

/** Same-origin proxy so the download filename is honored and missing files error cleanly. */
export const RESUME_DOWNLOAD_PATH = "/api/public/resume/file";

function downloadFileName(file_name: string | null): string {
  const trimmed = file_name?.trim();
  if (trimmed) return trimmed;
  return "Sahin_Alam_Resume.pdf";
}

function saveBlob(blob: Blob, name: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = name;
  a.rel = "noopener noreferrer";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(objectUrl);
}

function looksLikeFileBlob(blob: Blob): boolean {
  if (blob.size < 32) return false;
  const type = blob.type.toLowerCase();
  if (type.includes("application/json") || type.startsWith("text/")) return false;
  return true;
}

/**
 * Triggers a browser download of the active resume.
 * Prefers the same-origin API (heals a stale/missing storage URL) then the metadata URL.
 * Returns false when the file cannot be retrieved — never opens a 404 JSON tab.
 */
export async function triggerResumeDownload(
  resume: ResumeDownloadSource,
): Promise<boolean> {
  const name = downloadFileName(resume.file_name);
  const urls = [RESUME_DOWNLOAD_PATH, resume.file_url].filter(Boolean);

  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const blob = await res.blob();
      if (!looksLikeFileBlob(blob)) continue;
      saveBlob(blob, name);
      return true;
    } catch {
      /* try next source */
    }
  }
  return false;
}
