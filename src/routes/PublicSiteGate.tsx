import { useSiteSettingsMap } from "@/hooks/useSiteSettingsMap";
import { getComingSoonContent, isComingSoonEnabled } from "@/lib/siteMode";
import { ComingSoonPage } from "@/pages/ComingSoonPage";
import { PageSpinner } from "@/routes/PageSpinner";
import { Outlet, useLocation } from "react-router-dom";

export function PublicSiteGate(): JSX.Element {
  const location = useLocation();
  const { settings, loading } = useSiteSettingsMap();

  if (location.pathname.startsWith("/admin")) {
    return <Outlet />;
  }

  if (loading) {
    return <PageSpinner />;
  }

  if (isComingSoonEnabled(settings)) {
    return <ComingSoonPage {...getComingSoonContent(settings)} />;
  }

  return <Outlet />;
}
