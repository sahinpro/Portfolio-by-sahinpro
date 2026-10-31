import { inter, monteCarlo } from "@/lib/fonts";
import type { Metadata, Viewport } from "next";
import "./globals.css";

/**
 * Root layout for the Workspace (Lead CRM) deployment.
 *
 * Deliberately minimal — the public site's `PublicLayoutShell` (coming-soon gate,
 * page-view tracker, Vercel analytics, perf boot script) belongs to
 * www.sahinpro.me and must not run here. Auth chrome lives in
 * `WorkspaceProtectedLayout`, which is where the CRM tree mounts.
 */
export const metadata: Metadata = {
  title: "Workspace",
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      {
        url: "/icons/favicon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      { url: "/favicon.ico", sizes: "48x48" },
    ],
    shortcut: "/icons/favicon-48x48.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${monteCarlo.variable}`}
      suppressHydrationWarning
    >
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
