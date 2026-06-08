import { HomePage } from "@/views/HomePage";
import { buildPublicMetadata } from "@/lib/metadata";

export async function generateMetadata() {
  return buildPublicMetadata("/", "/");
}

export default function Page() {
  return <HomePage />;
}
