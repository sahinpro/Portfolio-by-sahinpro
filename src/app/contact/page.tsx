import { ContactPage } from "@/views/ContactPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/contact", "/contact");
export const revalidate = 3600;

type PageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { topic } = await searchParams;
  const initialSubject =
    topic === "free-website-check" ? "Free website check" : "";
  return <ContactPage initialSubject={initialSubject} />;
}
