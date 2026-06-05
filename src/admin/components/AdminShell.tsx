import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import {
  BarChart3,
  BookOpen,
  ChevronDown,
  ExternalLink,
  FileText,
  FolderKanban,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  Search,
  Settings2,
  Share2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import avatarUrl from "/sahin.png";

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

const subNavClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "flex items-center gap-2 rounded-md pl-8 pr-2.5 py-1.5 text-xs font-medium outline-none transition-colors",
    "focus-visible:ring-2 focus-visible:ring-white/15 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950",
    isActive
      ? "bg-white/[0.07] text-zinc-100"
      : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300",
  );

const sectionLabel =
  "px-2.5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500";

function mobileAdminTitle(pathname: string): string {
  if (pathname === "/admin" || pathname === "/admin/") return "Dashboard";
  if (pathname.startsWith("/admin/projects")) return "Projects";
  if (pathname.startsWith("/admin/testimonials")) return "Testimonials";
  if (pathname.startsWith("/admin/blog")) return "Blog";
  if (pathname.startsWith("/admin/media")) return "Media";
  if (pathname.startsWith("/admin/analytics")) return "Analytics";
  if (pathname.startsWith("/admin/settings")) return "Settings";
  return "Admin";
}

function AdminSidebarProfile(): JSX.Element {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  const email = user?.email ?? "";

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
              {email || "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AdminShell(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [siteSettingsMenuOpen, setSiteSettingsMenuOpen] = useState(false);
  const isSettingsRoute = location.pathname.startsWith("/admin/settings");
  const siteSettingsMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileNavOpen(false);
    setSiteSettingsMenuOpen(false);
  }, [location.pathname]);

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

  useEffect(() => {
    if (!siteSettingsMenuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        siteSettingsMenuRef.current &&
        !siteSettingsMenuRef.current.contains(event.target as Node)
      ) {
        setSiteSettingsMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [siteSettingsMenuOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
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
          aria-controls="admin-sidebar-nav"
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
            Admin Panel
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="truncate text-sm font-semibold tracking-tight text-zinc-100">
              {mobileAdminTitle(location.pathname)}
            </span>
          </div>
        </div>
        <a
          href="/"
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
        id="admin-sidebar-nav"
        className={cn(
          "flex w-[17.5rem] shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950",
          "bg-[linear-gradient(180deg,rgb(24_24_27)_0%,rgb(9_9_11)_100%)]",
          "fixed inset-y-0 left-0 z-50 h-[100dvh] transition-transform duration-200 ease-out",
          "max-lg:shadow-[4px_0_24px_rgba(0,0,0,0.45)]",
          mobileNavOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
          // Keep the sidebar fixed even on desktop; the <main> is padded accordingly.
          "lg:h-screen",
        )}
      >
        <div className="shrink-0 px-2 pt-4 pb-2">
          <AdminSidebarProfile />
        </div>

        <ScrollArea className="flex-1 min-h-0 px-2">
          <nav className="pr-6 pb-4">
            <p className={sectionLabel}>Main</p>
            <div className="flex flex-col gap-0.5">
              <NavLink to="/admin" end className={navClass}>
                <LayoutDashboard className="h-4 w-4 shrink-0 opacity-80" />
                Dashboard
              </NavLink>
              <NavLink to="/admin/projects" className={navClass}>
                <FolderKanban className="h-4 w-4 shrink-0 opacity-80" />
                Projects
              </NavLink>
              <NavLink to="/admin/testimonials" className={navClass}>
                <MessageSquareQuote className="h-4 w-4 shrink-0 opacity-80" />
                Testimonials
              </NavLink>
              <NavLink to="/admin/blog" className={navClass}>
                <BookOpen className="h-4 w-4 shrink-0 opacity-80" />
                Blogs
              </NavLink>
              <NavLink to="/admin/media" className={navClass}>
                <ImageIcon className="h-4 w-4 shrink-0 opacity-80" />
                Media library
              </NavLink>
              <NavLink to="/admin/analytics" className={navClass}>
                <BarChart3 className="h-4 w-4 shrink-0 opacity-80" />
                Analytics
              </NavLink>
            </div>

            <p className={cn(sectionLabel, "mt-4")}>Settings</p>
            <div
              ref={siteSettingsMenuRef}
              role="group"
              aria-label="Site settings and related pages"
              className="relative"
            >
              <div className="flex items-stretch gap-1">
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) =>
                    cn(navClass({ isActive }), "min-w-0 flex-1")
                  }
                >
                  <Settings2 className="h-4 w-4 shrink-0 opacity-80" />
                  <span className="truncate">Site settings</span>
                </NavLink>
                <button
                  type="button"
                  onClick={() => setSiteSettingsMenuOpen((open) => !open)}
                  className={cn(
                    navLinkBase,
                    "w-10 justify-center px-0",
                    isSettingsRoute || siteSettingsMenuOpen
                      ? "bg-white/[0.09] text-white shadow-sm border border-white/[0.08]"
                      : "text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-100 border border-transparent",
                  )}
                  aria-label="Open site settings menu"
                  aria-haspopup="menu"
                  aria-expanded={siteSettingsMenuOpen}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-200",
                      siteSettingsMenuOpen && "rotate-180",
                    )}
                  />
                </button>
              </div>
              {siteSettingsMenuOpen ? (
                <div
                  className="mt-1 ml-2 rounded-lg border border-zinc-800/80 bg-zinc-900/95 p-1.5 text-zinc-100 shadow-2xl shadow-black/40 backdrop-blur-md"
                  role="menu"
                  aria-label="Site settings submenu"
                >
                  <div className="flex flex-col gap-0.5">
                    <NavLink
                      to="/admin/settings/social"
                      className={subNavClass}
                    >
                      <Share2 className="h-3.5 w-3.5 opacity-70 shrink-0" />
                      Social links
                    </NavLink>
                    <NavLink to="/admin/settings/seo" className={subNavClass}>
                      <Search className="h-3.5 w-3.5 opacity-70 shrink-0" />
                      SEO
                    </NavLink>
                    <NavLink
                      to="/admin/settings/resume"
                      className={subNavClass}
                    >
                      <FileText className="h-3.5 w-3.5 opacity-70 shrink-0" />
                      Resume
                    </NavLink>
                  </div>
                </div>
              ) : null}
            </div>
          </nav>
        </ScrollArea>

        <div className="shrink-0 border-t border-zinc-800/80 bg-zinc-950/90 backdrop-blur-sm px-2 py-3 space-y-0.5">
          <a
            href="/"
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
          <Outlet />
        </div>
      </main>
    </div>
  );
}
