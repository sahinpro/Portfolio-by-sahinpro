import { AboutPage } from "@/views/AboutPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/about", "/about");
export const revalidate = 3600;

export default function Page() {
  return <AboutPage />;
}
