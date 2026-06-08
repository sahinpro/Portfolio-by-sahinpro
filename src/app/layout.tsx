import { SiteStructuredDataScript } from "@/components/public/SiteStructuredDataScript";
import { inter, monteCarlo } from "@/lib/fonts";
import { DEFAULT_META_DESCRIPTION, DEFAULT_META_TITLE } from "@/lib/seoDefaults";
import { OG_IMAGE } from "@/lib/seoImages";
import { getSiteUrl } from "@/constants/site";
import type { Metadata, Viewport } from "next";
import { PublicLayoutShell } from "@/components/layout/PublicLayoutShell";
import "./globals.css";

/** ISR for public routes (1 h). Keep in sync with REVALIDATE_SECONDS in @/lib/revalidate. */
export const revalidate = 3600;

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: DEFAULT_META_TITLE,
    template: `%s | Sahin Alam`,
  },
  description: DEFAULT_META_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    images: [
      {
        url: OG_IMAGE.url,
        width: OG_IMAGE.width,
        height: OG_IMAGE.height,
        alt: OG_IMAGE.alt,
        type: OG_IMAGE.type,
      },
    ],
  },
  alternates: {
    types: {
      "application/xml": "/sitemap.xml",
    },
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${monteCarlo.variable}`}>
      <head>
        <SiteStructuredDataScript />
      </head>
      <body className={`${inter.className} antialiased`}>
        <noscript>
          <div
            style={{
              maxWidth: "48rem",
              margin: "2rem auto",
              padding: "0 1rem",
              fontFamily: "system-ui, sans-serif",
              lineHeight: 1.6,
            }}
          >
            <h1>Sahin Alam — Full Stack Developer</h1>
            <p>
              Full Stack Developer from Bangladesh specializing in React, Next.js,
              WordPress, WooCommerce, and Shopify. Explore the portfolio at{" "}
              <a href="https://sahin.pro.bd/">sahin.pro.bd</a>.
            </p>
            <nav aria-label="Primary">
              <ul>
                <li>
                  <a href="/about">About</a>
                </li>
                <li>
                  <a href="/projects">Projects</a>
                </li>
                <li>
                  <a href="/services">Services</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </nav>
          </div>
        </noscript>
        <PublicLayoutShell>{children}</PublicLayoutShell>
      </body>
    </html>
  );
}
