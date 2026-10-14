import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { UnsubscribeForm } from "@/components/unsubscribe-form";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Unsubscribe", referrer: "no-referrer", robots: { index: false, follow: false, noarchive: true } };
export const dynamic = "force-dynamic";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token?.trim() ?? "";
  const client = createAdminClient();
  const subscriber = uuidPattern.test(token) && client
    ? (await client.from("subscribers").select("name").eq("unsubscribe_token", token).maybeSingle()).data
    : null;
  return <><PageHero eyebrow="Email preferences" title="Unsubscribe" lede="You are in control of the information you share with Terratora." image="/images/hero/reporting.jpg" imagePosition="50% 48%" crumbs={[{ label: "Unsubscribe" }]} /><section className="unsubscribe-page" data-color-flow="clear"><div className="shell unsubscribe-card"><p className="eyebrow">Data removal request</p>{subscriber ? <><h2>{subscriber.name}, would you like to stop receiving our emails?</h2><p>Confirm below and we will immediately remove your subscriber record. This does not affect information you may have separately submitted through an enquiry or booking form.</p><UnsubscribeForm token={token} /></> : <><h2>This unsubscribe link is no longer available.</h2><p>It may already have been used. If you still receive emails from us, contact <a href="mailto:privacy@terratoraconsulting.com">privacy@terratoraconsulting.com</a>.</p></>}</div></section></>;
}
