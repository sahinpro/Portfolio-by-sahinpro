import { AdminChallengeHtmlPage } from "@/admin/pages/AdminChallengeHtmlPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <AdminChallengeHtmlPage slug={slug} />;
}
