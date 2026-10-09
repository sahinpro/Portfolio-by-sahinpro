import { AdminProjectsListPage } from "@/admin/pages/AdminProjectsListPage";

export default function ProjectsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminProjectsListPage>{children}</AdminProjectsListPage>;
}
