"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const storageKey = "terratora-cookie-preferences";
type Preferences = { necessary: true; functional: boolean; analytics: boolean; marketing: boolean };
const optionalOff: Preferences = { necessary: true, functional: false, analytics: false, marketing: false };
const allOn: Preferences = { necessary: true, functional: true, analytics: true, marketing: true };

export function CookieConsent() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [customising, setCustomising] = useState(false);
  const [preferences, setPreferences] = useState<Preferences>(optionalOff);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try { setPreferences({ ...optionalOff, ...JSON.parse(saved), necessary: true }); } catch { setVisible(true); }
    } else {
      setVisible(true);
    }
    const openSettings = () => { setCustomising(true); setVisible(true); };
    window.addEventListener("terratora:cookie-settings", openSettings);
    return () => window.removeEventListener("terratora:cookie-settings", openSettings);
  }, []);

  if (!visible || pathname.startsWith("/admin")) return null;

  function save(value: Preferences) {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent("terratora:cookie-preferences-changed", { detail: value }));
    setPreferences(value);
    setCustomising(false);
    setVisible(false);
  }

  if (customising) return <div className="cookie-modal-backdrop" role="presentation"><section className="cookie-preferences" role="dialog" aria-modal="true" aria-labelledby="cookie-preferences-title">
    <header><div><p className="eyebrow">Your privacy choices</p><h2 id="cookie-preferences-title">Cookie preferences</h2></div><button type="button" onClick={() => setCustomising(false)} aria-label="Close cookie preferences">Close</button></header>
    <p>We use strictly necessary cookies to make our site work and functional cookies to enhance the overall experience. We also use optional analytics cookies to help us continually improve the service.</p>
    <p>You can continue with these cookies or change them by customising your settings. View the cookies this site uses on our <Link href="/cookies" target="_blank">Cookie Policy page <span className="sr-only">(opens in a new window)</span></Link>.</p>
    <div className="cookie-choice-list">
      <CookieChoice title="Strictly Necessary Cookies" description="We use strictly necessary cookies to ensure our website operates securely and properly. These also store your privacy preferences." checked locked onChange={() => undefined} />
      <CookieChoice title="Functional Cookies" description="These cookies remember choices such as language preferences or interactive tools to provide enhanced personalisation. Disabling them may affect non-essential site features." checked={preferences.functional} onChange={(functional) => setPreferences({ ...preferences, functional })} />
      <CookieChoice title="Performance & Analytics Cookies" description="These cookies collect aggregated and pseudonymised data to help us monitor traffic, identify popular pages and improve the website experience." checked={preferences.analytics} onChange={(analytics) => setPreferences({ ...preferences, analytics })} />
      <CookieChoice title="Marketing & Social Media Cookies" description="These cookies may be set by trusted partners such as LinkedIn to track engagement with publications and display relevant professional ESG insights." checked={preferences.marketing} onChange={(marketing) => setPreferences({ ...preferences, marketing })} />
    </div>
    <footer><button type="button" onClick={() => save(preferences)}>Save &amp; Apply My Choices</button><button className="button button-dark" type="button" onClick={() => save(allOn)}>Accept All Cookies</button></footer>
  </section></div>;

  return <aside className="cookie-banner" aria-label="Cookie preferences">
    <div><strong>Cookies on Terratora</strong><p>We use strictly necessary cookies to make our site work and functional cookies to enhance the overall experience. We also use optional analytics cookies to help us continually improve the service.</p><span>You can continue with these cookies or change them by customising your settings. Read our <Link href="/cookies" target="_blank">Cookie Policy <span className="sr-only">(opens in a new window)</span></Link>.</span></div>
    <div className="cookie-actions"><button type="button" onClick={() => save(allOn)}>Accept All Cookies</button><button type="button" onClick={() => save(optionalOff)}>Reject All Cookies</button><button type="button" onClick={() => setCustomising(true)}>Customize Settings</button></div>
  </aside>;
}

function CookieChoice({ title, description, checked, locked = false, onChange }: { title: string; description: string; checked: boolean; locked?: boolean; onChange: (checked: boolean) => void }) {
  return <article className="cookie-choice"><div><h3>{title}</h3><p>{description}</p></div>{locked ? <strong>Always Active</strong> : <label className="cookie-toggle"><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span aria-hidden="true" /><em>{checked ? "Allowed" : "Not allowed"}</em></label>}</article>;
}
