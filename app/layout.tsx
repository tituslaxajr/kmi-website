import type { Metadata } from "next";
import { headers } from "next/headers";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/newsreader/500.css";
import "@fontsource/newsreader/500-italic.css";
import "@fontsource/newsreader/600.css";
import "@fontsource/newsreader/700.css";
import "./globals.css";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "kapatidministry.org";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase).toString();
  return {
  metadataBase,
  title: {
    default: "Kapatid Ministry | Alongside local churches",
    template: "%s | Kapatid Ministry",
  },
  description:
    "See how local churches serve, follow field updates, pray for current needs, and give with clarity through Kapatid Ministry.",
  icons: {
    icon: "/brand-mark.png",
    shortcut: "/brand-mark.png",
    apple: "/brand-mark.png",
  },
  openGraph: {
    title: "God’s mission. The church at work. Your partnership.",
    description: "Pray, give, and follow the work of local churches across the Philippines.",
    type: "website",
    locale: "en_PH",
    siteName: "Kapatid Ministry",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "God’s mission. The church at work. Your partnership." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kapatid Ministry",
    description: "Alongside local churches in the Philippines.",
    images: [socialImage],
  },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
