"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { Post, SiteContent } from "@/lib/types";
import { Logo } from "./logo";
import { SiteSearch } from "./site-search";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/services", "Services"],
  ["/journal", "Publications"],
  ["/careers", "Careers"],
];

export function Header({ content, posts }: { content: SiteContent; posts: Post[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const hasImageHero = pathname === "/" || ["/about", "/services", "/journal", "/careers", "/contact", "/contact/message", "/book", "/privacy", "/cookies"].includes(pathname) || pathname.startsWith("/journal/");
  const isOverHero = hasImageHero && !scrolled && !open;

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "menu-is-open" : ""} ${isOverHero ? "header-on-image" : ""}`}>
      <div className="header-inner">
        <Logo light={isOverHero} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}>{label}</Link>)}
          <div className="contact-dropdown"><Link href="/contact" className={pathname.startsWith("/contact") || pathname === "/book" ? "active" : ""}>Contact us</Link><div><Link href="/contact/message">Send us a message</Link><Link href="/book">Book a session</Link></div></div>
        </nav>
        <SiteSearch content={content} posts={posts} />
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          <span /> <span />
        </button>
      </div>
      <div className="mobile-menu">
        <nav aria-label="Mobile navigation">
          {links.map(([href, label]) => <Link key={href} href={href}>{label}</Link>)}
          <Link href="/contact">Contact us</Link>
          <div className="mobile-contact-options"><Link href="/contact/message">Send us a message</Link><Link href="/book">Book a session</Link></div>
        </nav>
      </div>
    </header>
  );
}
