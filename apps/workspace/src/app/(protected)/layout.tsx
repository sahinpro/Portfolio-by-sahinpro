import { WorkspaceProtectedLayout } from "@/admin/components/WorkspaceProtectedLayout";
import { workspaceMetadata } from "@/lib/metadata";

/** CRM routes require auth/session — never statically cached. */
export const dynamic = "force-dynamic";

export const metadata = workspaceMetadata;

export default function ProtectedLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <WorkspaceProtectedLayout>{children}</WorkspaceProtectedLayout>;
}
