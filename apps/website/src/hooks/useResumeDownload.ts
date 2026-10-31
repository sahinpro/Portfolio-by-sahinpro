"use client";

import {
  triggerResumeDownload,
  type ResumeDownloadSource,
} from "@/lib/resumeDownload";
import { useCallback, useState } from "react";

export function useResumeDownload() {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const download = useCallback(async (resume: ResumeDownloadSource) => {
    setDownloading(true);
    setError(null);
    const ok = await triggerResumeDownload(resume);
    setDownloading(false);
    if (!ok) {
      setError("The resume file could not be downloaded. Please try again.");
    }
  }, []);

  return { download, downloading, error };
}
