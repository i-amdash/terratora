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
              <radialGradient id="footer-ocean" cx="29%" cy="22%" r="82%">
                <stop offset="0" stopColor="#a7e3ec" />
                <stop offset="0.2" stopColor="#3da9bf" />
                <stop offset="0.58" stopColor="#08728e" />
                <stop offset="0.84" stopColor="#03445d" />
                <stop offset="1" stopColor="#012838" />
              </radialGradient>
              <linearGradient id="footer-land" x1="0" y1="0" x2="0.8" y2="1">
                <stop offset="0" stopColor="#e5f5d0" />
                <stop offset="0.48" stopColor="#9fcf9c" />
                <stop offset="1" stopColor="#5e9e83" />
              </linearGradient>
              <radialGradient id="footer-globe-shade" cx="31%" cy="25%" r="76%">
                <stop offset="0" stopColor="#ffffff" stopOpacity="0.18" />
                <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
                <stop offset="0.76" stopColor="#001b28" stopOpacity="0.14" />
                <stop offset="1" stopColor="#00121c" stopOpacity="0.72" />
              </radialGradient>
              <filter id="footer-land-shadow" x="-15%" y="-15%" width="130%" height="140%">
                <feDropShadow dx="-1" dy="2" stdDeviation="2" floodColor="#002f3f" floodOpacity="0.45" />
              </filter>
              <clipPath id="footer-globe-clip">
                <circle cx="120" cy="120" r="113" />
              </clipPath>
              <g id="footer-world-map">
                <path d="M14 55 26 45l14-4 11-11 18 1 11 7 14 3 9 9-6 9-9 3 2 9-7 6-9-5-5 8-9 3-4 13-11 4-5-9-11-1-8-10-11-4 4-10-7-5Z" />
                <path d="m63 104 11 5 8 9 8 4 3 12-6 11-4 18-7 10-4 18-7 13-5-20-7-12-2-17-7-16 4-13 9-7Z" />
                <path d="m61 25 12-9 16 4 6 11-7 10-15 1-11-7Z" />
                <path d="m121 57 8-9 13-1 8 6 11-4 9 5 13-6 22 6 15 8 11 13-5 9-13 1-6 8-15 2-9 7-13-2-10-7-11 3-8-7-12-1-7-8 4-7Z" />
                <path d="m133 98 13-3 13 7 9 13-3 17-7 12-5 18-11 14-9-7-4-17-7-14 4-13-5-12 7-6Z" />
                <path d="m199 149 12-5 14 8 6 13-7 11-14-1-10 6-12-7 2-13Z" />
                <path d="m232 96 5-5 3 7-5 8-4-4Z" />
                <path d="m174 170 4 4-3 9-4-5Z" />
              </g>
              <g id="footer-world-relief">
                <path d="m30 58 15-7 13 5 11 12-12 2-9 9-13-7Z" />
                <path d="m61 126 10 5 6 11-4 13-7-3-5-14Z" />
                <path d="m141 62 13-4 10 8-6 8-13-2Z" />
                <path d="m143 112 11 4 5 12-6 12-10-5-5-13Z" />
                <path d="m205 158 12-5 6 9-7 7-11-2Z" />
              </g>
              <g id="footer-clouds">
                <path d="M4 73c21-12 40-11 61-2 14 6 28 5 43-1" />
                <path d="M83 38c17-7 35-5 52 3 12 6 23 6 38 1" />
                <path d="M137 139c19-8 37-6 55 3 13 6 27 5 44-2" />
                <path d="M20 176c17-6 32-4 47 3 10 5 20 5 32 1" />
              </g>
            </defs>
            <circle cx="120" cy="120" r="113" fill="url(#footer-ocean)" />
            <g className="footer-globe-land-band" clipPath="url(#footer-globe-clip)" filter="url(#footer-land-shadow)">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-240 0" dur="42s" repeatCount="indefinite" calcMode="linear" />
              <g transform="translate(-240 0)"><use href="#footer-world-map" /><use className="footer-globe-relief" href="#footer-world-relief" /></g>
              <g><use href="#footer-world-map" /><use className="footer-globe-relief" href="#footer-world-relief" /></g>
              <g transform="translate(240 0)"><use href="#footer-world-map" /><use className="footer-globe-relief" href="#footer-world-relief" /></g>
            </g>
            <g className="footer-globe-cloud-band" clipPath="url(#footer-globe-clip)">
              <animateTransform attributeName="transform" type="translate" from="0 0" to="-240 0" dur="58s" repeatCount="indefinite" calcMode="linear" />
              <use href="#footer-clouds" x="-240" />
              <use href="#footer-clouds" />
              <use href="#footer-clouds" x="240" />
            </g>
            <g className="footer-globe-grid" clipPath="url(#footer-globe-clip)">
              <ellipse cx="120" cy="120" rx="45" ry="112" />
              <ellipse cx="120" cy="120" rx="82" ry="112" />
              <ellipse cx="120" cy="120" rx="112" ry="39" />
              <ellipse cx="120" cy="120" rx="112" ry="76" />
              <path d="M8 120h224" />
            </g>
            <circle cx="120" cy="120" r="113" fill="url(#footer-globe-shade)" />
            <ellipse className="footer-globe-glint" cx="79" cy="62" rx="37" ry="20" />
            <circle className="footer-globe-rim" cx="120" cy="120" r="112.5" />
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
        <div><span>Follow</span><a href="https://www.linkedin.com/company/terratoraconsulting" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://x.com/terratora_ng" target="_blank" rel="noreferrer">X ↗</a><a href="https://www.instagram.com/terratora_ng" target="_blank" rel="noreferrer">Instagram ↗</a><p>{content.global.location}</p></div>
      </div>
      <div className="shell footer-bottom">
        <Logo light />
        <div className="footer-links"><Link href="/privacy">Privacy</Link><Link href="/cookies">Cookies</Link><CookieSettingsButton /></div>
        <p>© {new Date().getFullYear()} Terratora<br />Think clearly. Move boldly.</p>
      </div>
    </footer>
  );
}
