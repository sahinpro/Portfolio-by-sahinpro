"use client";

import { AdminShell } from "@/admin/components/AdminShell";
import { DuplicateUploadConfirmProvider } from "@/admin/context/DuplicateUploadConfirmContext";
import { ToastProvider } from "@/admin/context/ToastContext";
import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { supabase } from "@/utils/supabase";
import type { Session } from "@supabase/supabase-js";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ReactNode } from "react";

/**
 * Four distinct states. A session-check that *fails* is deliberately kept apart
 * from a check that proves there is *no* session, so a transient error never
 * signs a valid admin out or bounces them to the login page.
 *   checking        — first validation still in flight
 *   authenticated   — a session was confirmed present (authz applied on top)
 *   unauthenticated — validation succeeded and there is genuinely no session
 *   error           — validation itself failed (network/refresh); recoverable
 */
type AuthStatus = "checking" | "authenticated" | "unauthenticated" | "error";

export function AdminProtectedLayout({
  children,
}: {
  children: ReactNode;
}): JSX.Element | null {
  const router = useRouter();
  const pathname = usePathname();
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [session, setSession] = useState<Session | null>(null);
  // Bumped only by the manual Retry button; keeps retries user-initiated so a
  // transient failure can never turn into an automatic refresh/retry loop.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data: { session: s }, error }) => {
        if (!mounted) return;
        // An error here means we could not *verify* the session, not that the
        // user is authenticated. Treat it as recoverable, never as signed-out.
        if (error) {
          setStatus("error");
          return;
        }
        setSession(s ?? null);
        setStatus(s ? "authenticated" : "unauthenticated");
      })
      .catch(() => {
        if (!mounted) return;
        setStatus("error");
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s ?? null);
      // Real auth events are authoritative: a signed-out / no-session event is
      // a confirmed absence and should allow the redirect; a live session means
      // authenticated. Neither is a "validation error".
      if (s) {
        setStatus("authenticated");
      } else if (event === "SIGNED_OUT") {
        setStatus("unauthenticated");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [attempt]);

  // Authorization is enforced independently of the authentication *status*: a
  // confirmed session whose email is not on the allow-list is signed out.
  useEffect(() => {
    if (
      status === "authenticated" &&
      session?.user &&
      !isAllowedAdminEmail(session.user)
    ) {
      void supabase.auth.signOut();
      setSession(null);
      setStatus("unauthenticated");
    }
  }, [status, session]);

  // Redirect ONLY when we have positively established that authentication is
  // absent or not permitted. `checking` and `error` never redirect.
  useEffect(() => {
    if (status !== "unauthenticated") return;
    const from = encodeURIComponent(pathname);
    router.replace(`/admin/login?from=${from}`);
  }, [status, pathname, router]);

  const retry = useCallback(() => {
    setStatus("checking");
    setAttempt((a) => a + 1);
  }, []);

  if (status === "checking") {
    return (
      <div
        className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white/50
          text-sm"
      >
        Checking session…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 px-4
          text-center"
      >
        <p className="text-white/70 text-sm">
          We couldn&apos;t verify your session.
        </p>
        <p className="text-white/40 text-xs">
          This is usually a temporary network issue. Your login is still valid.
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-sm
            font-semibold text-white transition-colors hover:bg-white/15"
        >
          Try again
        </button>
      </div>
    );
  }

  // status === "unauthenticated" (or authenticated-but-disallowed, which the
  // authz effect has already reduced to unauthenticated). Render nothing while
  // the redirect runs; never expose admin children in this state.
  if (
    status !== "authenticated" ||
    !session?.user ||
    !isAllowedAdminEmail(session.user)
  ) {
    return null;
  }

  return (
    <ToastProvider>
      <DuplicateUploadConfirmProvider>
        <AdminShell session={session}>{children}</AdminShell>
      </DuplicateUploadConfirmProvider>
    </ToastProvider>
  );
}
