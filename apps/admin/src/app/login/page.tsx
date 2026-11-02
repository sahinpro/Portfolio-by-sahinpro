import { AdminLoginPage } from "@/admin/pages/AdminLoginPage";
import { adminMetadata } from "@/lib/metadata";
import { PageSpinner } from "@sahinpro/shared/PageSpinner";
import { Suspense } from "react";

/** Login reads the session — never statically cached. */
export const dynamic = "force-dynamic";

export const metadata = adminMetadata;

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AdminLoginPage />
    </Suspense>
  );
}
