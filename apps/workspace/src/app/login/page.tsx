import { WorkspaceLoginPage } from "@/admin/pages/WorkspaceLoginPage";
import { workspaceMetadata } from "@/lib/metadata";
import { PageSpinner } from "@sahinpro/shared/PageSpinner";
import { Suspense } from "react";

export const metadata = workspaceMetadata;

export default function Page() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <WorkspaceLoginPage />
    </Suspense>
  );
}
