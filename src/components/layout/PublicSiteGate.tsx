"use client";

import { isAllowedAdminEmail } from "@/admin/lib/authHelpers";
import { SkipToContent } from "@/components/layout/SkipToContent";
import { fetchSiteSettingsMap } from "@/data/publicSupabase";
import { deferUntilIdle } from "@/lib/deferUntilIdle";
import { getCachedPublic } from "@/lib/publicDataCache";
import { getComingSoonContent, isComingSoonEnabled } from "@/lib/siteMode";
import { ComingSoonPage } from "@/views/ComingSoonPage";
import { PageSpinner } from "@/components/common/PageSpinner";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

export function PublicSiteGate({ children }: { children: ReactNode }): JSX.Element {
  const pathname = usePathname();
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

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (comingSoonActive) {
    if (adminBypass === null) {
      return <PageSpinner />;
    }
    if (adminBypass) {
      return (
        <>
          <SkipToContent />
          {children}
        </>
      );
    }
    return <ComingSoonPage {...getComingSoonContent(settings)} />;
  }

  return (
    <>
      <SkipToContent />
      {children}
    </>
  );
}
