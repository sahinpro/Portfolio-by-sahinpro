import { AdminLeadsListPage } from "@/admin/pages/AdminLeadsListPage";

export default function LeadsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminLeadsListPage>{children}</AdminLeadsListPage>;
}
