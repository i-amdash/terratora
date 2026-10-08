import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RevealProvider } from "@/components/reveal";
import { PageTransition } from "@/components/page-transition";
import { ColorFlow } from "@/components/color-flow";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteAnalytics } from "@/components/site-analytics";
import { NavigationLoading } from "@/components/navigation-loading";
import { getPosts, getSiteContent } from "@/lib/content";
import { siteUrl } from "@/lib/site-url";
import "@fontsource-variable/figtree";
import "@fontsource-variable/public-sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Terratora — ESG & Sustainability Advisory", template: "%s — Terratora" },
  description: "Terratora helps organisations translate sustainability requirements into practical action, reliable information and stronger business capability.",
  applicationName: "Terratora",
  authors: [{ name: "Terratora" }],
  creator: "Terratora",
  publisher: "Terratora",
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "Terratora",
    title: "Terratora — ESG & Sustainability Advisory",
    description: "Terratora helps organisations translate sustainability requirements into practical action, reliable information and stronger business capability.",
    url: "/",
    images: [{ url: "/images/hero/reporting.jpg", alt: "Terratora ESG and sustainability advisory" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Terratora — ESG & Sustainability Advisory",
    description: "Practical ESG, sustainability and reporting insight for organisations in Nigeria, Africa and global markets.",
    images: ["/images/hero/reporting.jpg"],
  },
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body className="antialiased" suppressHydrationWarning><RevealProvider /><ColorFlow /><Suspense fallback={null}><NavigationLoading /></Suspense><Header content={content} posts={posts} /><main><PageTransition>{children}</PageTransition></main><Footer content={content} /><SiteAnalytics /><CookieConsent /></body></html>;
}
