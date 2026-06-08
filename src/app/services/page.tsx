import { ServicesPage } from "@/views/ServicesPage";
import { buildPublicMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return buildPublicMetadata("/services", "/services");
}

export default function Page() {
  return <ServicesPage />;
}
