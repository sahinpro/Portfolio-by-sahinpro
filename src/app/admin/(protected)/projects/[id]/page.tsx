import { AdminProjectFormPage } from "@/admin/pages/AdminProjectFormPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminProjectFormPage projectId={id} />;
}
