import type { Metadata } from "next";
import { Cormorant_Garamond, IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { Providers } from "@/components/Providers";

const display = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Mihbash Cafe & Dining · مهباش",
    template: "%s · Mihbash Cafe & Dining",
  },
  description:
    "Mihbash Cafe & Dining · مهباش — specialty coffee, matcha, all-day breakfast. Open everyday 8:00 AM – 2:00 AM. Umm Suqeim, Dubai. قهوة مختصة، ماتشا، وفطور طوال اليوم.",
  openGraph: {
    title: "Mihbash Cafe & Dining · مهباش",
    description:
      "Specialty coffee, house matcha, all-day breakfast. Open everyday 8:00 AM – 2:00 AM. Umm Suqeim, Dubai.",
    locale: "en_AE",
    alternateLocale: ["ar_AE"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${arabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-navy text-white">
        <Providers>
          <AnalyticsTracker />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
