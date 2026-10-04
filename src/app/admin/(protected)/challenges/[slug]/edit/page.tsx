import { AdminChallengeFormPage } from "@/admin/pages/AdminChallengeFormPage";
import { AdminChallengesListPage } from "@/admin/pages/AdminChallengesListPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return (
    <AdminChallengesListPage>
      <AdminChallengeFormPage slug={slug} />
    </AdminChallengesListPage>
  );
}
