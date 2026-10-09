import { AdminLoginPage } from "@/admin/pages/AdminLoginPage";
import { adminMetadata } from "@/lib/metadata";
import { Suspense } from "react";
import { PageSpinner } from "@/components/common/PageSpinner";

export const metadata = adminMetadata;

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <AdminLoginPage />
    </Suspense>
  );
}
