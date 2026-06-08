"use client";

import { useDuplicateUploadConfirm } from "@/admin/context/DuplicateUploadConfirmContext";
import { useToast } from "@/admin/context/ToastContext";
import { withRlsHint } from "@/admin/lib/formatAdminError";
import { uploadPublicFileContentAddressed } from "@/admin/lib/storageUpload";
import type { ResumeRow } from "@/admin/types/database";
import { Input } from "@/components/ui/input";
import { invalidatePublicDataCache } from "@/lib/publicDataCache";
import { supabase } from "@/utils/supabase";
import { Copy, Upload } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";

export function AdminResumePage(): JSX.Element {
  const { showToast } = useToast();
  const { openPrompt } = useDuplicateUploadConfirm();
  const [rows, setRows] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("resume")
      .select("*")
      .order("uploaded_at", { ascending: false });
    setLoading(false);
    if (error) {
      showToast(withRlsHint(error.message), "error");
      return;
    }
    setRows((data ?? []) as ResumeRow[]);
  }, [showToast]);

  useEffect(() => {
    void load();
  }, [load]);

  const active = rows.find((r) => r.is_active);

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files ?? []);
    input.value = "";
    const file = files[0];
    if (!file) return;
    setUploading(true);
    try {
      const { publicUrl: url } = await uploadPublicFileContentAddressed(
        "documents",
        "cv",
        file,
      );
      const { data: sameFile } = await supabase.from("resume").select("id").eq("file_url", url).maybeSingle();
      if (sameFile) {
        await openPrompt({
          variant: "acknowledge",
          title: "Resume already on file",
          message: (
            <>
              This file is already in your resume list (same stored document). Open the list below to
              activate it or remove older versions.
            </>
          ),
          confirmLabel: "OK",
        });
        void load();
        return;
      }
      const { data: existing } = await supabase.from("resume").select("id");
      for (const ex of existing ?? []) {
        await supabase.from("resume").update({ is_active: false }).eq("id", ex.id);
      }
      const { error } = await supabase.from("resume").insert({
        file_url: url,
        file_name: file.name,
        is_active: true,
      });
      if (error) throw new Error(error.message);
      invalidatePublicDataCache();
      showToast("Resume uploaded and set active");
      void load();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      showToast(withRlsHint(msg), "error");
    } finally {
      setUploading(false);
    }
  };

  const copyUrl = (url: string) => {
    void navigator.clipboard.writeText(url);
    showToast("Copied URL");
  };

  const setActiveRow = async (id: string) => {
    const { data: existing } = await supabase.from("resume").select("id");
    for (const ex of existing ?? []) {
      await supabase.from("resume").update({ is_active: false }).eq("id", ex.id);
    }
    const { error } = await supabase.from("resume").update({ is_active: true }).eq("id", id);
    if (error) {
      showToast(withRlsHint(error.message), "error");
      return;
    }
    invalidatePublicDataCache();
    showToast("Active resume updated");
    void load();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-white mb-2">Resume / CV</h1>
      <p className="text-sm text-white/45 mb-8">Uploads go to the documents bucket.</p>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] p-5 space-y-4 mb-8">
        <p className="text-xs text-white/40 uppercase tracking-wider">Active file</p>
        {active ? (
          <div className="space-y-2">
            <Input readOnly className={field} value={active.file_name ?? "resume"} />
            <div className="flex flex-wrap gap-2">
              <a
                href={active.file_url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-violet-300 hover:underline"
              >
                Open file
              </a>
              <button
                type="button"
                onClick={() => copyUrl(active.file_url)}
                className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
              >
                <Copy className="h-3 w-3" />
                Copy URL
              </button>
            </div>
            <p className="text-xs text-white/35">
              Uploaded {new Date(active.uploaded_at).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="text-sm text-white/45">No active resume yet.</p>
        )}

        <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={onFile} />
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {uploading ? "Uploading…" : "Replace / upload"}
        </button>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#111] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/[0.08] text-sm font-medium text-white">
          History
        </div>
        {loading ? (
          <p className="p-4 text-sm text-white/45">Loading…</p>
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {rows.map((r) => (
              <li key={r.id} className="px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-white">{r.file_name ?? "File"}</p>
                  <p className="text-xs text-white/35">{new Date(r.uploaded_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {r.is_active ? (
                    <span className="text-[10px] uppercase font-semibold text-emerald-400">Active</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void setActiveRow(r.id)}
                      className="text-xs text-violet-300 hover:underline"
                    >
                      Set active
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
