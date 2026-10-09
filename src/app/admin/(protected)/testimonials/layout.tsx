import { AdminTestimonialsListPage } from "@/admin/pages/AdminTestimonialsListPage";

export default function TestimonialsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminTestimonialsListPage>{children}</AdminTestimonialsListPage>
  );
}
