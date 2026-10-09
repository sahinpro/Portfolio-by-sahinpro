"use client";

import { AdminSidePanel } from "@/admin/components/ui/AdminSidePanel";
import { useToast } from "@/admin/context/ToastContext";
import { adminAuthHeader, htmlDocumentTitle } from "@/admin/lib/challengeMappers";
import { Input } from "@/components/ui/input";
import { FileCode2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const field =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none focus:border-white/20";
const labelCls = "block text-xs font-medium text-white/50 mb-1.5";

export function AdminChallengeFormPage({
  slug,
}: {
  slug?: string;
}): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const isNewRoute = !slug;
  const [loadingRow, setLoadingRow] = useState(!isNewRoute);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [fileName, setFileName] = useState("");
  const [htmlFile, setHtmlFile] = useState<File | null>(null);

  const closePanel = useCallback(() => {
    if (saving) return;
    router.replace("/admin/challenges");
  }, [router, saving]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoadingRow(true);
    void (async () => {
      const response = await fetch(`/api/admin/challenges/${slug}`, {
        headers: await adminAuthHeader(),
      });
      const body = (await response.json()) as {
        challenge?: { title: string };
        error?: string;
      };
      if (cancelled) return;
      setLoadingRow(false);
      if (!response.ok || !body.challenge) {
        showToast(body.error ?? "Challenge not found", "error");
        router.replace("/admin/challenges");
        return;
      }
      setTitle(body.challenge.title);
      setFileName("Current HTML file");
    })();
    return () => {
      cancelled = true;
    };
  }, [router, showToast, slug]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const text = await file.text();
    if (!/<html[\s>]/i.test(text) && !/<body[\s>]/i.test(text)) {
      showToast("That file does not look like an HTML document.", "error");
      return;
    }
    setHtmlFile(file);
    setFileName(file.name);
    if (!title.trim()) {
      const fromDocument = htmlDocumentTitle(text);
      if (fromDocument) setTitle(fromDocument);
    }
  };

  const onSubmit = async () => {
    const trimmed = title.trim();
    if (!trimmed) {
      showToast("Title is required", "error");
      return;
    }
    if (isNewRoute && !htmlFile) {
      showToast("Add an HTML file", "error");
      return;
    }

    setSaving(true);
    try {
      const form = new FormData();
      form.set("title", trimmed);
      if (htmlFile) form.set("html", htmlFile);
      const response = await fetch(
        isNewRoute ? "/api/admin/challenges" : `/api/admin/challenges/${slug}`,
        {
          method: isNewRoute ? "POST" : "PUT",
          headers: await adminAuthHeader(),
          body: form,
        },
      );
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        showToast(body.error ?? "Could not save challenge", "error");
        return;
      }
      showToast(isNewRoute ? "Challenge saved" : "Challenge updated");
      router.replace("/admin/challenges");
    } catch {
      showToast("Could not save challenge. Try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingRow) {
    return (
      <AdminSidePanel
        title="Edit challenge"
        description="Loading…"
        onClose={closePanel}
        busy={saving}
      >
        <div className="flex items-center justify-center gap-2 py-20 text-sm text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading…
        </div>
      </AdminSidePanel>
    );
  }

  return (
    <AdminSidePanel
      title={isNewRoute ? "New challenge" : "Edit challenge"}
      description="The HTML file is saved in this project and runs only inside the admin panel."
      onClose={closePanel}
      busy={saving}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit();
        }}
        className="mx-auto max-w-3xl space-y-6 pb-20"
        noValidate
      >
        <section className="space-y-4 rounded-xl border border-white/[0.08] bg-[#111] p-5">
          <h2 className="text-sm font-semibold text-white">Challenge</h2>
          <div>
            <label className={labelCls} htmlFor="challenge-title">
              Title
            </label>
            <Input
              id="challenge-title"
              className={field}
              placeholder="90-Day Income Build"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="challenge-html">
              HTML file
            </label>
            <label
              htmlFor="challenge-html"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-4 py-8 text-center hover:bg-white/[0.05]"
            >
              <FileCode2 className="h-6 w-6 text-white/40" />
              <span className="text-sm font-medium text-white/80">
                {fileName || "Choose an .html file"}
              </span>
              <span className="text-xs text-white/40">
                {isNewRoute
                  ? "This file is what opens when you click the challenge."
                  : "Leave this as-is to keep the current file, or choose a replacement."}
              </span>
              <input
                id="challenge-html"
                type="file"
                accept=".html,text/html"
                className="sr-only"
                onChange={(event) => {
                  void onFile(event.target.files?.[0]);
                  event.target.value = "";
                }}
              />
            </label>
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            aria-busy={saving}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black hover:bg-white/90 disabled:pointer-events-none disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Saving…
              </>
            ) : isNewRoute ? (
              "Save challenge"
            ) : (
              "Save changes"
            )}
          </button>
          <button
            type="button"
            onClick={closePanel}
            disabled={saving}
            className="rounded-lg border border-white/15 px-5 py-2.5 text-sm font-medium text-white/80 hover:bg-white/[0.06] disabled:pointer-events-none disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </AdminSidePanel>
  );
}
