"use client";

import { supabase } from "@sahinpro/shared/supabase";
import { Card, CardContent } from "@sahinpro/shared/ui/card";
import { ScrollArea } from "@sahinpro/shared/ui/scroll-area";
import { cn } from "@sahinpro/shared/utils";
import type { Session, User } from "@supabase/supabase-js";
import { ExternalLink, LogOut, Menu, Target, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { WORKSPACE_AVATAR_PATH } from "@/lib/branding";

const avatarUrl = WORKSPACE_AVATAR_PATH;

const navLinkBase =
  "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm font-medium outline-none transition-colors " +
  "focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950";

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    navLinkBase,
    isActive
      ? "bg-white/[0.09] text-white shadow-sm border border-white/[0.08]"
      : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100 border border-transparent",
  );

const sectionLabel =
  "px-2.5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500";

/** Active-route aware nav link, local to this app (no cross-app import). */
function WorkspaceNavLink({
  href,
  end = false,
  className,
  children,
  onClick,
}: {
  href: string;
  end?: boolean;
  className: string | ((args: { isActive: boolean }) => string);
  children: ReactNode;
  onClick?: () => void;
}): JSX.Element {
  const pathname = usePathname();
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const normalizedHref = href.replace(/\/$/, "") || "/";
  const isActive = end
    ? normalizedPath === normalizedHref
    : normalizedPath === normalizedHref ||
      normalizedPath.startsWith(`${normalizedHref}/`);

  const resolvedClassName =
    typeof className === "function" ? className({ isActive }) : className;

  return (
    <Link href={href} className={cn(resolvedClassName)} onClick={onClick}>
      {children}
    </Link>
  );
}

function mobileTitle(pathname: string): string {
  if (pathname.startsWith("/leads/new")) return "New lead";
  if (/^\/leads\/[^/]+$/.test(pathname)) return "Lead details";
  return "Leads";
}

/**
 * Rendered from the session the protected layout already resolved. Deliberately
 * makes no auth call of its own — every `getSession()`/`onAuthStateChange()`
 * acquires the shared Supabase Navigator lock, and duplicating it here was one
 * of the concurrent acquisitions colliding on page load.
 */
function WorkspaceSidebarProfile({ user }: { user: User }): JSX.Element {
  const email = user.email ?? "";

  return (
    <Card
      className="mx-1 border-zinc-800/80 bg-zinc-900/40 shadow-none rounded-lg
        ring-1 ring-inset ring-white/[0.04]"
    >
      <CardContent className="p-3">
        <div className="flex flex-col flex-nowrap text-center items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt=""
              className="h-20 w-20 rounded-full object-cover border border-zinc-700/80 bg-zinc-800"
            />
            <span
              className="absolute bottom-2 right-[5px] h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-zinc-900"
              title="Signed in"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold text-zinc-100 leading-tight truncate">
              Sahin Alam
            </h3>
            <p
              className="text-[14px] text-zinc-500 truncate mt-0.5"
              title={email}
            >
              {email || "  "}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceShell({
  children,
  session,
}: {
  children: ReactNode;
  session: Session;
}): JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMobileNavOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileNavOpen]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mobileNavOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col lg:flex-row">
      <header
        className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-zinc-800/80 bg-zinc-950/95 px-3
          backdrop-blur-md lg:hidden"
      >
        <button
          type="button"
          onClick={() => setMobileNavOpen((o) => !o)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-zinc-700/80 bg-zinc-900/80
            text-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.2)] outline-none transition-colors hover:bg-zinc-800
            focus-visible:ring-2 focus-visible:ring-white/20"
          aria-expanded={mobileNavOpen}
          aria-controls="workspace-sidebar-nav"
          aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
        >
          {mobileNavOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Workspace
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-100">
              {mobileTitle(pathname)}
            </span>
          </div>
        </div>
        <a
          href="https://www.sahinpro.me"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3
            text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden min-[380px]:inline">Site</span>
          <img
            src={avatarUrl}
            alt=""
            className="h-5 w-5 rounded-full border border-white/10 object-cover"
          />
        </a>
      </header>

      {mobileNavOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-black/55 backdrop-blur-[2px] lg:hidden"
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        id="workspace-sidebar-nav"
        className={cn(
          "flex w-[17.5rem] shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950",
          "bg-[linear-gradient(180deg,rgb(24_24_27)_0%,rgb(9_9_11)_100%)]",
          "fixed inset-y-0 left-0 z-50 h-[100dvh] transition-transform duration-200 ease-out",
          "max-lg:shadow-[4px_0_24px_rgba(0,0,0,0.45)]",
          mobileNavOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          "lg:h-screen",
        )}
      >
        <div className="shrink-0 px-2 pt-4 pb-2">
          <WorkspaceSidebarProfile user={session.user} />
        </div>

        <ScrollArea className="flex-1 min-h-0 px-2">
          <nav className="pr-6 pb-4">
            <p className={sectionLabel}>Outreach CRM</p>
            <div className="flex flex-col gap-0.5">
              <WorkspaceNavLink href="/leads" end className={navClass}>
                <Target className="h-4 w-4 shrink-0 opacity-80" />
                Leads
              </WorkspaceNavLink>
              <WorkspaceNavLink href="/leads/new" className={navClass}>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
                New lead
              </WorkspaceNavLink>
            </div>
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm px-2 py-3 space-y-0.5">
          <a
            href="https://www.sahinpro.me"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              navLinkBase,
              "text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200 border border-transparent",
            )}
          >
            <ExternalLink className="h-4 w-4 shrink-0 opacity-80" />
            View site
          </a>
          <button
            type="button"
            onClick={handleSignOut}
            className={cn(
              navLinkBase,
              "w-full text-left text-red-400/90 hover:bg-red-500/10 hover:text-red-300 border border-transparent",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main
        className="flex-1 overflow-auto min-w-0 bg-zinc-950 min-h-0
          lg:pl-[17.5rem]
          [background-image:radial-gradient(ellipse_85%_55%_at_50%_-18%,rgba(99,102,241,0.11),transparent_58%)]"
      >
        <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
