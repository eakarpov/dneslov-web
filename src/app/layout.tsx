import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import StoreProvider from "./StoreProvider";
import Navbar from "./common/Navbar";
import { SITE_URL } from "../lib/site";

const inter = Inter({ subsets: ["cyrillic-ext"] });

export const metadata: Metadata = {
  // Without this, canonical and og:url come out relative and resolve against
  // whatever host happens to serve the page.
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Днеслов",
    template: "%s",
  },
  description: "Онлайн-справочник церковных календарей",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicons/dneslov-fav.svg", type: "image/svg+xml" },
      { url: "/favicons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [
      { url: "/favicons/apple-touch-icon-180x180.png", sizes: "180x180" },
      { url: "/favicons/apple-touch-icon-152x152.png", sizes: "152x152" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <StoreProvider>
          {/* Chrome lives here so every page — including error.tsx and
              not-found.tsx — keeps its navigation. */}
          <Navbar />
          <main className="page-shell">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
