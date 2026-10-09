"use client";

import { useToast } from "@/admin/context/ToastContext";
import { adminAuthHeader, prepareChallengeHtml } from "@/admin/lib/challengeMappers";
import { Button } from "@/components/ui/button";
import { supabase } from "@/utils/supabase";
import { Loader2, Pencil } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AdminChallengeHtmlPage({
  slug,
}: {
  slug: string;
}): JSX.Element {
  const router = useRouter();
  const { showToast } = useToast();
  const [title, setTitle] = useState("");
  const [srcDoc, setSrcDoc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch(`/api/admin/challenges/${slug}`, {
        headers: await adminAuthHeader(),
      });
      const body = (await response.json()) as {
        challenge?: { title: string; html: string };
        error?: string;
      };
      if (cancelled) return;
      setLoading(false);
      if (!response.ok || !body.challenge) {
        showToast(body.error ?? "Challenge not found", "error");
        router.replace("/admin/challenges");
        return;
      }
      setTitle(body.challenge.title);
      setSrcDoc(
        prepareChallengeHtml(
          body.challenge.html,
          slug,
          session?.access_token ?? "",
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [router, showToast, slug]);

  if (loading || !srcDoc) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-white/50">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading challenge…
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100dvh-8.5rem)] min-h-[32rem] flex-col gap-3 lg:h-[calc(100dvh-5rem)]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            href="/admin/challenges"
            className="text-xs font-medium text-white/40 hover:text-white/70"
          >
            Challenges
          </Link>
          <h1 className="truncate text-lg font-semibold tracking-tight text-white">
            {title}
          </h1>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="shrink-0 border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/[0.06] hover:text-white"
        >
          <Link href={`/admin/challenges/${slug}/edit`}>
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Link>
        </Button>
      </div>
      <iframe
        title={title}
        srcDoc={srcDoc}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
        className="min-h-0 w-full flex-1 rounded-xl border border-white/10 bg-white"
      />
    </div>
  );
}
