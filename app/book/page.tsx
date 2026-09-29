import type { Metadata } from "next";
import { ContactForm } from "@/components/forms";

export const metadata: Metadata = { title: "Book a session" };

export default function BookPage() {
  return <section className="contact-layout"><div className="shell"><div className="contact-top"><div><p className="eyebrow">One focused hour</p><h1>Let&apos;s find the<br />way <em>forward.</em></h1></div><p className="contact-intro">Book a no-pressure working session with a Terratora strategist. We&apos;ll explore your challenge, identify the sharpest question, and agree what—if anything—should happen next.</p></div><div className="contact-body"><aside className="contact-details"><div><span>What to expect</span><p>60 minutes<br />Video call<br />No preparation needed</p></div><div><span>After you submit</span><p>We&apos;ll review your context and confirm the best available time by email.</p></div></aside><ContactForm booking /></div></div></section>;
}
