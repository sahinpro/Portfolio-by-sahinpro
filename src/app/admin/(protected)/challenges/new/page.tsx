import { AdminChallengeFormPage } from "@/admin/pages/AdminChallengeFormPage";
import { AdminChallengesListPage } from "@/admin/pages/AdminChallengesListPage";

export default function Page() {
  return (
    <AdminChallengesListPage>
      <AdminChallengeFormPage />
    </AdminChallengesListPage>
  );
}
