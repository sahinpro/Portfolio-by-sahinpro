import { AdminLoginPage } from "@/admin/pages/AdminLoginPage";
import { adminMetadata } from "@/lib/metadata";
import { PageSpinner } from "@sahinpro/shared/PageSpinner";
import { Suspense } from "react";

export const metadata = adminMetadata;

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AdminLoginPage />
    </Suspense>
  );
}
