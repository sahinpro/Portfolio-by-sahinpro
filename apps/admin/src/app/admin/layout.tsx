/** Admin routes require auth/session — never statically cached. */
export const dynamic = "force-dynamic";

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
