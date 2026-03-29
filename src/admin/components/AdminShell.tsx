import { useUnreadInboxCount } from "@/admin/hooks/useUnreadInboxCount";
import { supabase } from "@/utils/supabase";
import type { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquareQuote,
  Search,
  Settings2,
  Share2,
  FileText,
  Inbox,
  FolderKanban,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

const sectionLabel = "px-2.5 pt-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500";

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

  const displayName =
    import.meta.env.VITE_ADMIN_DISPLAY_NAME?.trim() ||
    (typeof user?.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : "") ||
    (typeof user?.user_metadata?.name === "string" ? user.user_metadata.name.trim() : "") ||
    user?.email?.split("@")[0] ||
    "Admin";

  const email = user?.email ?? "";

  const avatarUrl =
    import.meta.env.VITE_ADMIN_AVATAR_URL?.trim() ||
    (typeof user?.user_metadata?.avatar_url === "string"
      ? user.user_metadata.avatar_url.trim()
      : "") ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff&size=128`;

  return (
    <Card
      className="mx-1 border-zinc-800/80 bg-zinc-900/40 shadow-none rounded-lg
        ring-1 ring-inset ring-white/[0.04]"
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt=""
              className="h-11 w-11 rounded-full object-cover border border-zinc-700/80 bg-zinc-800"
            />
            <span
              className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-zinc-900"
              title="Signed in"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-100 leading-tight truncate">{displayName}</p>
            <p className="text-[11px] text-zinc-500 truncate mt-0.5" title={email}>
              {email || "—"}
            </p>
          </div>
        </div>
        <Separator className="my-3 bg-zinc-800" />
        <p className="text-[10px] font-medium uppercase tracking-widest text-zinc-600">Portfolio admin</p>
      </CardContent>
    </Card>
  );
}

export function AdminShell(): JSX.Element {
  const navigate = useNavigate();
  const unread = useUnreadInboxCount();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex">
      <aside
        className="flex h-screen w-[17.5rem] shrink-0 flex-col border-r border-zinc-800/80 bg-zinc-950
          bg-[linear-gradient(180deg,rgb(24_24_27)_0%,rgb(9_9_11)_100%)]"
      >
        <div className="shrink-0 px-2 pt-4 pb-2">
          <AdminSidebarProfile />
        </div>

        <ScrollArea className="flex-1 min-h-0 px-2">
          <nav className="pr-2 pb-4">
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
                Blog
              </NavLink>
              <NavLink to="/admin/media" className={navClass}>
                <ImageIcon className="h-4 w-4 shrink-0 opacity-80" />
                Media library
              </NavLink>
              <NavLink to="/admin/inbox" className={navClass}>
                <Inbox className="h-4 w-4 shrink-0 opacity-80" />
                <span className="flex-1 text-left">Inbox</span>
                {unread > 0 ? (
                  <span
                    className="min-w-[1.25rem] rounded-full bg-red-500/90 px-1.5 py-0.5 text-center text-[10px]
                      font-bold text-white tabular-nums"
                  >
                    {unread > 99 ? "99+" : unread}
                  </span>
                ) : null}
              </NavLink>
              <NavLink to="/admin/analytics" className={navClass}>
                <BarChart3 className="h-4 w-4 shrink-0 opacity-80" />
                Analytics
              </NavLink>
            </div>

            <p className={cn(sectionLabel, "mt-4")}>Settings</p>
            <div className="flex flex-col gap-0.5">
              <NavLink to="/admin/settings" className={navClass}>
                <Settings2 className="h-4 w-4 shrink-0 opacity-80" />
                Site settings
              </NavLink>
              <NavLink to="/admin/settings/social" className={subNavClass}>
                <Share2 className="h-3.5 w-3.5 opacity-70 shrink-0" />
                Social links
              </NavLink>
              <NavLink to="/admin/settings/seo" className={subNavClass}>
                <Search className="h-3.5 w-3.5 opacity-70 shrink-0" />
                SEO
              </NavLink>
              <NavLink to="/admin/settings/resume" className={subNavClass}>
                <FileText className="h-3.5 w-3.5 opacity-70 shrink-0" />
                Resume
              </NavLink>
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
        className="flex-1 overflow-auto min-w-0 bg-zinc-950
          [background-image:radial-gradient(ellipse_85%_55%_at_50%_-18%,rgba(99,102,241,0.11),transparent_58%)]"
      >
        <div className="max-w-7xl mx-auto px-6 py-8 lg:px-10 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
