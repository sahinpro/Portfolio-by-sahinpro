import { AdminProtectedLayout } from "@/admin/components/AdminProtectedLayout";
import { adminMetadata } from "@/lib/metadata";

export const metadata = adminMetadata;

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminProtectedLayout>{children}</AdminProtectedLayout>;
}
