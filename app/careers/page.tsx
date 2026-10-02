import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";

export const metadata: Metadata = { title: "Careers" };

export default function CareersPage() {
  return <><PageHero eyebrow="Join our team" title="Help shape what comes next." lede="Sustainability is reshaping how organisations think about strategy, risk, reporting, governance and long-term value." image="/images/hero/operations.jpg" imagePosition="50% 50%" crumbs={[{ label: "Careers" }]} /><section className="careers-intro" data-color-flow="aqua"><div className="shell careers-intro-grid" data-reveal><h2>Curious about change. Practical about progress.</h2><div><p>We are building a team of professionals who are curious about this change and want to help organisations navigate it.</p><p>Whether your expertise is in accounting, finance, sustainability, risk, governance, data, strategy or business, Terratora offers the opportunity to apply your skills to complex challenges at the intersection of business and sustainability.</p></div></div></section><section className="careers-page" data-color-flow="clear"><div className="shell careers-grid"><p className="section-index">Current opportunities</p><div data-reveal><span className="availability-pill">Applications closed</span><h2>We are not currently recruiting for any open positions.</h2><p>As our team grows, opportunities will be posted on this page. Please check back periodically for current openings. We look forward to welcoming exceptional talent to Terratora as we grow.</p></div></div></section></>;
}
