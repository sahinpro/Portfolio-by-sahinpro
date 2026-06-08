"use client";

import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminShell } from "@/admin/components/AdminShell";
import { DuplicateUploadConfirmProvider } from "@/admin/context/DuplicateUploadConfirmContext";
import { ToastProvider } from "@/admin/context/ToastContext";
import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";

export function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user && !isAllowedAdminEmail(session.user)) {
      void supabase.auth.signOut();
      setSession(null);
    }
  }, [session]);

  useEffect(() => {
    if (session === undefined) return;
    if (!session?.user) {
      const from = encodeURIComponent(pathname);
      router.replace(`/admin/login?from=${from}`);
    } else if (!isAllowedAdminEmail(session.user)) {
      router.replace("/admin/login");
    }
  }, [session, pathname, router]);

  if (session === undefined) {
    return (
      <div
        className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50
          text-sm"
      >
        Checking session…
      </div>
    );
  }

  if (!session?.user || !isAllowedAdminEmail(session.user)) {
    return null;
  }

  return (
    <ToastProvider>
      <DuplicateUploadConfirmProvider>
        <AdminShell>{children}</AdminShell>
      </DuplicateUploadConfirmProvider>
    </ToastProvider>
  );
}
