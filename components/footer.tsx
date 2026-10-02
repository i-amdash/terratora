import Link from "next/link";
import type { SiteContent } from "@/lib/types";
import { Logo } from "./logo";
import { ArrowUpRight } from "./icons";
import { CookieSettingsButton } from "./cookie-settings-button";

export function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer" id="site-footer" data-color-flow="deep">
      <div className="footer-earth-scene" aria-hidden="true">
        <span className="footer-earth-orbit orbit-one" />
        <span className="footer-earth-orbit orbit-two" />
        <span className="footer-earth">
          <svg viewBox="0 0 240 240" focusable="false">
            <defs>
              <radialGradient id="footer-ocean" cx="31%" cy="24%" r="76%">
                <stop offset="0" stopColor="#bdeaf0" />
                <stop offset="0.22" stopColor="#49b8cc" />
                <stop offset="0.68" stopColor="#08738f" />
                <stop offset="1" stopColor="#032f43" />
              </radialGradient>
              <clipPath id="footer-globe-clip">
                <circle cx="120" cy="120" r="113" />
              </clipPath>
              <g id="footer-world-map">
                <path d="M31 51 45 39l23 2 16 13 11 20-7 13-14 1-5 14-13 2-12-12-10-2-7-18Z" />
                <path d="m57 108 16 5 12 14-3 17-10 11-4 24-11 14-7-25-9-18 6-19Z" />
                <path d="m108 55 13-11 18 3 8 8 19-8 31 8 19 16-5 13-24 4-14 12-20-4-12-13-18 1-14-12Z" />
                <path d="m123 91 21 4 16 18-6 28-16 30-15-9-9-25 5-17-9-15Z" />
                <path d="m184 151 19-8 15 10-7 16-21 5-12-11Z" />
              </g>
            </defs>
            <circle cx="120" cy="120" r="113" fill="url(#footer-ocean)" />
            <g className="footer-globe-grid" clipPath="url(#footer-globe-clip)">
              <ellipse cx="120" cy="120" rx="50" ry="112" />
              <ellipse cx="120" cy="120" rx="88" ry="112" />
              <ellipse cx="120" cy="120" rx="112" ry="43" />
              <ellipse cx="120" cy="120" rx="112" ry="78" />
            </g>
            <g className="footer-globe-land-band" clipPath="url(#footer-globe-clip)">
              <use href="#footer-world-map" />
              <use href="#footer-world-map" x="240" />
            </g>
            <circle className="footer-globe-rim" cx="120" cy="120" r="112" />
          </svg>
        </span>
      </div>
      <div className="shell footer-main" data-reveal>
        <p className="eyebrow light">Your next move</p>
        <h2>Let&apos;s continue<br /><em>the conversation.</em></h2>
        <Link className="footer-contact-link" href="/contact">Contact us <ArrowUpRight /></Link>
      </div>
      <div className="shell footer-directory">
        <div><span>Services</span>{content.services.items.map((service) => <Link key={service.title} href={`/services#${service.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}>{service.title}</Link>)}</div>
        <div><span>Explore</span><Link href="/about">About us</Link><Link href="/journal">Publications</Link><Link href="/careers">Careers</Link><Link href="/contact">Contact</Link><Link href="/book">Book a session</Link></div>
        <div><span>Follow</span><a href="https://www.linkedin.com/company/terratoraconsulting" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://x.com/terratora_ng" target="_blank" rel="noreferrer">X ↗</a><a href="https://www.instagram.com/terratora_ng" target="_blank" rel="noreferrer">Instagram ↗</a><p>{content.global.location}</p><a className="footer-small-email" href={`mailto:${content.global.email}`}>{content.global.email}</a></div>
      </div>
      <div className="shell footer-bottom">
        <Logo light />
        <div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><CookieSettingsButton /></div>
        <p>© {new Date().getFullYear()} Terratora<br />Think clearly. Move boldly.</p>
      </div>
    </footer>
  );
}
