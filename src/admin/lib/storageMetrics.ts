import { env } from "@/lib/env";
import { supabase } from "@/utils/supabase";
import type { FileObject } from "@supabase/storage-js";

/** Buckets used across the admin (media library + resume documents). */
export const STORAGE_METRIC_BUCKETS = ["portfolio-assets", "documents"] as const;

export type StorageMetrics = {
  fileCount: number;
  totalBytes: number;
  bucketCount: number;
  quotaBytes: number;
  remainingBytes: number;
  usagePercent: number;
};

async function walkBucketForStats(
  bucket: string,
  prefix: string,
  stats: { fileCount: number; totalBytes: number },
): Promise<void> {
  const { data, error } = await supabase.storage.from(bucket).list(prefix, {
    limit: 1000,
    sortBy: { column: "updated_at", order: "desc" },
  });
  if (error) throw error;

  for (const item of (data ?? []) as FileObject[]) {
    const path = prefix ? `${prefix}/${item.name}` : item.name;
    if (item.id === null) {
      await walkBucketForStats(bucket, path, stats);
      continue;
    }
    stats.fileCount += 1;
    const size = (item.metadata as { size?: number } | null)?.size;
    if (typeof size === "number" && Number.isFinite(size)) {
      stats.totalBytes += size;
    }
  }
}

export async function fetchStorageMetrics(): Promise<StorageMetrics> {
  const stats = { fileCount: 0, totalBytes: 0 };

  for (const bucket of STORAGE_METRIC_BUCKETS) {
    await walkBucketForStats(bucket, "", stats);
  }

  const quotaBytes = env.supabaseStorageQuotaBytes;
  const remainingBytes = Math.max(0, quotaBytes - stats.totalBytes);
  const usagePercent =
    quotaBytes > 0
      ? Math.min(100, Math.round((stats.totalBytes / quotaBytes) * 100))
      : 0;

  return {
    fileCount: stats.fileCount,
    totalBytes: stats.totalBytes,
    bucketCount: STORAGE_METRIC_BUCKETS.length,
    quotaBytes,
    remainingBytes,
    usagePercent,
  };
}

export function formatStorageSize(bytes: number): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"] as const;
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const value = bytes / 1024 ** exponent;
  const digits = exponent === 0 ? 0 : value >= 100 ? 0 : value >= 10 ? 1 : 2;
  return `${value.toFixed(digits)} ${units[exponent]}`;
}
