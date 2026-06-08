import { NotFoundPage } from "@/views/NotFoundPage";
import { notFoundMetadata } from "@/lib/metadata";

export const metadata = notFoundMetadata;

export default function NotFound() {
  return <NotFoundPage />;
}
