import { ContactPage } from "@/views/ContactPage";
import { buildPublicMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return buildPublicMetadata("/contact", "/contact");
}

export default function Page() {
  return <ContactPage />;
}
