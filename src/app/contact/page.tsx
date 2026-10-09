import { ContactPage } from "@/views/ContactPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/contact", "/contact");
export const revalidate = 3600;

export default function Page() {
  return <ContactPage />;
}
