import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RevealProvider } from "@/components/reveal";
import { PageTransition } from "@/components/page-transition";
import { ColorFlow } from "@/components/color-flow";
import { CookieConsent } from "@/components/cookie-consent";
import { getSiteContent } from "@/lib/content";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Terratora — ESG & Sustainability Advisory", template: "%s — Terratora" },
  description: "Terratora helps organisations translate sustainability requirements into practical action, reliable information and stronger business capability.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body className="antialiased" suppressHydrationWarning><RevealProvider /><ColorFlow /><Header /><main><PageTransition>{children}</PageTransition></main><Footer content={content} /><CookieConsent /></body></html>;
}
