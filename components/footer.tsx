import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { Logo } from "./logo";
import { ArrowUpRight } from "./icons";

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer" data-color-flow="deep">
      <div className="footer-orbit" aria-hidden="true"><span /><span /><span /></div>
      <div className="shell footer-main" data-reveal>
        <p className="eyebrow light">Your next move</p>
        <h2>Let&apos;s make<br /><em>something shift.</em></h2>
        <Link className="footer-email" href={`mailto:${content.global.email}`}>{content.global.email}<ArrowUpRight /></Link>
      </div>
      <div className="shell footer-bottom">
        <Logo light />
        <div className="footer-links">
          <Link href="/about">About</Link><Link href="/services">Services</Link><Link href="/journal">Journal</Link><Link href="/contact">Contact</Link><Link href="/admin">Admin</Link>
        </div>
        <p>© {new Date().getFullYear()} Terratora<br />Think clearly. Move boldly.</p>
      </div>
    </footer>
  );
}
