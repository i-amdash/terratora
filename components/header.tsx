"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { ArrowUpRight } from "./icons";

const links = [
  ["/about", "About"],
  ["/services", "Services"],
  ["/journal", "Publications"],
  ["/careers", "Careers"],
  ["/contact", "Contact"],
];

export function Header() {
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

  const hasImageHero = pathname === "/" || ["/about", "/services", "/journal", "/careers", "/contact", "/book", "/privacy", "/cookies"].includes(pathname) || pathname.startsWith("/journal/");
  const isOverHero = hasImageHero && !scrolled && !open;

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""} ${open ? "menu-is-open" : ""} ${isOverHero ? "header-on-image" : ""}`}>
      <div className="header-inner">
        <Logo light={isOverHero} />
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map(([href, label]) => <Link key={href} href={href} className={pathname === href ? "active" : ""}>{label}</Link>)}
        </nav>
        <Link className="nav-cta" href="/book">Book a session <ArrowUpRight /></Link>
        <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle navigation">
          <span /> <span />
        </button>
      </div>
      <div className="mobile-menu">
        <nav aria-label="Mobile navigation">
          {links.map(([href, label], index) => <Link key={href} href={href}><span>0{index + 1}</span>{label}</Link>)}
          <Link href="/book"><span>0{links.length + 1}</span>Book a session</Link>
        </nav>
      </div>
    </header>
  );
}
