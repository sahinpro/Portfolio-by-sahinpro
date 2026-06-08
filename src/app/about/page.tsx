import { AboutPage } from "@/views/AboutPage";
import { buildPublicMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return buildPublicMetadata("/about", "/about");
}

export default function Page() {
  return <AboutPage />;
}
