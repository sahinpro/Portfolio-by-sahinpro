import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { SkipToContent } from "@/components/SkipToContent";
import { fetchSiteSettingsMap } from "@/data/publicSupabase";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { getCachedPublic } from "@/lib/publicDataCache";
import { getComingSoonContent, isComingSoonEnabled } from "@/lib/siteMode";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { PageSpinner } from "@/routes/PageSpinner";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function PublicSiteGate(): JSX.Element {
  const location = useLocation();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsChecked, setSettingsChecked] = useState(false);
  const [adminBypass, setAdminBypass] = useState<boolean | null>(null);
  const comingSoonActive = settingsChecked && isComingSoonEnabled(settings);

  useEffect(() => {
    return deferUntilIdle(() => {
      void getCachedPublic("site_settings_map", fetchSiteSettingsMap)
        .then((nextSettings) => {
          setSettings(nextSettings);
          setSettingsChecked(true);
        })
        .catch(() => {
          setSettingsChecked(true);
        });
    }, 3500);
  }, []);

  useEffect(() => {
    if (!comingSoonActive) {
      setAdminBypass(false);
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    const resolveBypass = async (): Promise<void> => {
      const { supabase } = await import("@/utils/supabase");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!mounted) return;
      const user = session?.user ?? null;
      setAdminBypass(user ? isAllowedAdminEmail(user) : false);
    };

    void import("@/utils/supabase").then(({ supabase }) => {
      if (!mounted) return;
      void resolveBypass();
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(() => {
        void resolveBypass();
      });
      unsubscribe = () => subscription.unsubscribe();
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, [comingSoonActive]);

  if (location.pathname.startsWith("/admin")) {
    return <Outlet />;
  }

  if (comingSoonActive) {
    if (adminBypass === null) {
      return <PageSpinner />;
    }
    if (adminBypass) {
      return <Outlet />;
    }
    return <ComingSoonPage {...getComingSoonContent(settings)} />;
  }

  return (
    <>
      <SkipToContent />
      <Outlet />
    </>
  );
}
