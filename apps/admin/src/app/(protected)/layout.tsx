import { AdminProtectedLayout } from "@/admin/components/AdminProtectedLayout";
import { adminMetadata } from "@/lib/metadata";

/** Admin routes require auth/session — never statically cached. */
export const dynamic = "force-dynamic";

export const metadata = adminMetadata;

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
