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
import "@fontsource-variable/figtree";
import "@fontsource-variable/public-sans";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Terratora — ESG & Sustainability Advisory", template: "%s — Terratora" },
  description: "Terratora helps organisations translate sustainability requirements into practical action, reliable information and stronger business capability.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body className="antialiased" suppressHydrationWarning><RevealProvider /><ColorFlow /><Suspense fallback={null}><NavigationLoading /></Suspense><Header content={content} posts={posts} /><main><PageTransition>{children}</PageTransition></main><Footer content={content} /><SiteAnalytics /><CookieConsent /></body></html>;
}
