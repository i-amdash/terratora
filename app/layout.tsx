import type { Metadata, Viewport } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { RevealProvider } from "@/components/reveal";
import { PageTransition } from "@/components/page-transition";
import { getSiteContent } from "@/lib/content";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/newsreader";
import "@fontsource-variable/newsreader/wght-italic.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Terratora — Think clearly. Move boldly.", template: "%s — Terratora" },
  description: "Terratora is the strategic partner for leaders navigating a world that refuses to stand still.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const content = await getSiteContent();
  return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body className="antialiased" suppressHydrationWarning><RevealProvider /><Header /><main><PageTransition>{children}</PageTransition></main><Footer content={content} /></body></html>;
}
