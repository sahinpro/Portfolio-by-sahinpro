import { AdminLeadFormPage } from "@/admin/pages/AdminLeadFormPage";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  return <AdminLeadFormPage leadId={id} />;
}
