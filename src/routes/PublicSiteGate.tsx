import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { getComingSoonContent, isComingSoonEnabled } from "@/lib/siteMode";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { PageSpinner } from "@/routes/PageSpinner";
import { supabase } from "@/utils/supabase";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function PublicSiteGate(): JSX.Element {
  const location = useLocation();
  const { settings, loading: settingsLoading } = useSiteSettingsMap();
  const [adminBypass, setAdminBypass] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    const resolveBypass = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user ?? null;
      setAdminBypass(user ? isAllowedAdminEmail(user) : false);
    };

    void resolveBypass();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void resolveBypass();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (location.pathname.startsWith("/admin")) {
    return <Outlet />;
  }

  if (!settingsLoading && isComingSoonEnabled(settings)) {
    if (adminBypass === null) {
      return <PageSpinner />;
    }
    if (adminBypass) {
      return <Outlet />;
    }
    return <ComingSoonPage {...getComingSoonContent(settings)} />;
  }

  return <Outlet />;
}
