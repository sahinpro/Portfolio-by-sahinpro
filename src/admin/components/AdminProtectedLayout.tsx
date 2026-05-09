import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AdminShell } from "@/admin/components/AdminShell";
import { DuplicateUploadConfirmProvider } from "@/admin/context/DuplicateUploadConfirmContext";
import { ToastProvider } from "@/admin/context/ToastContext";
import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";

export function AdminProtectedLayout(): JSX.Element {
  const location = useLocation();
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

  if (!session?.user) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  if (!isAllowedAdminEmail(session.user)) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <ToastProvider>
      <DuplicateUploadConfirmProvider>
        <AdminShell />
      </DuplicateUploadConfirmProvider>
    </ToastProvider>
  );
}
