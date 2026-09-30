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
      <div className="shell footer-directory">
        <div><span>Services</span>{content.services.items.map((service) => <Link key={service.title} href={`/services#${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>{service.title}</Link>)}</div>
        <div><span>Explore</span><Link href="/about">About us</Link><Link href="/journal">Publications</Link><Link href="/careers">Careers</Link><Link href="/contact">Contact</Link><Link href="/book">Book a session</Link></div>
        <div><span>Follow</span><a href="https://www.linkedin.com/company/terratoraconsulting" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://x.com/terratora_ng" target="_blank" rel="noreferrer">X ↗</a><a href="https://www.instagram.com/terratora_ng" target="_blank" rel="noreferrer">Instagram ↗</a><p>{content.global.location}</p></div>
      </div>
      <div className="shell footer-bottom">
        <Logo light />
        <div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><Link href="/admin">Admin</Link></div>
        <p>© {new Date().getFullYear()} Terratora<br />Think clearly. Move boldly.</p>
      </div>
    </footer>
  );
}
