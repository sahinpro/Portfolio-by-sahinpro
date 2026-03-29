export type ResumeDownloadSource = {
  file_url: string;
  file_name: string | null;
};

function downloadFileName(file_name: string | null): string {
  const trimmed = file_name?.trim();
  if (trimmed) return trimmed;
  return "Sahin_Alam_Resume.pdf";
}

/**
 * Triggers a browser download of the resume PDF (or other file) from a public URL.
 * Uses a blob fetch when possible so the `download` filename is honored cross-origin.
 */
export async function triggerResumeDownload(
  resume: ResumeDownloadSource,
): Promise<void> {
  const name = downloadFileName(resume.file_name);
  try {
    const res = await fetch(resume.file_url);
    if (!res.ok) throw new Error("Failed to fetch file");
    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = name;
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  } catch {
    const a = document.createElement("a");
    a.href = resume.file_url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
}
