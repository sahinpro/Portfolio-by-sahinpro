import { ServicesPage } from "@/views/ServicesPage";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata = buildPageMetadata("/services", "/services");
export const revalidate = 3600;

export default function Page() {
  return <ServicesPage />;
}
