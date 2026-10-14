import { NextResponse } from "next/server";
import { getAdminSession, hasAdminPermission } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";
import { renderNewsletterEmail } from "@/lib/newsletters";

type SubscriberRecipient = { id: string; name: string; email: string; unsubscribe_token: string };

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session || !hasAdminPermission(session.profile, "manage_newsletters")) return NextResponse.json({ error: "You do not have permission to send newsletters." }, { status: 403 });
  const input = await request.json().catch(() => null);
  const subject = clean(input?.subject, 200).replace(/[\r\n]+/g, " ");
  const body = clean(input?.body, 50000);
  if (!subject || !body) return NextResponse.json({ error: "Enter a subject and newsletter body." }, { status: 400 });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({ error: "Configure RESEND_API_KEY and EMAIL_FROM before sending newsletters." }, { status: 503 });

  const client = createAdminClient();
  if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  const subscribers = await getSubscribers(client);
  if (!subscribers.length) return NextResponse.json({ error: "There are no subscribers to receive this newsletter." }, { status: 400 });
  const { data: newsletter, error: createError } = await client.from("newsletters").insert({ subject, body, status: "sending", recipient_count: 0, created_by: session.user.id }).select("id").single();
  if (createError || !newsletter) return NextResponse.json({ error: createError?.message ?? "The newsletter could not be created." }, { status: 500 });

  let sent = 0;
  try {
    for (let offset = 0; offset < subscribers.length; offset += 100) {
      const recipients = subscribers.slice(offset, offset + 100);
      const messages = recipients.map((subscriber) => {
        const email = renderNewsletterEmail({ subject, body, name: subscriber.name, unsubscribeToken: subscriber.unsubscribe_token });
        return {
          from: process.env.EMAIL_FROM,
          to: [subscriber.email],
          subject,
          html: email.html,
          text: email.text,
          headers: { "List-Unsubscribe": `<${email.unsubscribeUrl}>` },
        };
      });
      const response = await fetch("https://api.resend.com/emails/batch", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", "Idempotency-Key": `newsletter/${newsletter.id}/batch/${offset / 100}` },
        body: JSON.stringify(messages),
      });
      if (!response.ok) throw new Error(await resendError(response));
      sent += recipients.length;
      await client.from("newsletters").update({ recipient_count: sent, updated_at: new Date().toISOString() }).eq("id", newsletter.id);
    }
    await client.from("newsletters").update({ status: "sent", recipient_count: sent, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("id", newsletter.id);
    return NextResponse.json({ ok: true, recipient_count: sent });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The email provider rejected the newsletter.";
    await client.from("newsletters").update({ status: "failed", recipient_count: sent, last_error: message.slice(0, 1000), updated_at: new Date().toISOString() }).eq("id", newsletter.id);
    return NextResponse.json({ error: sent ? `Sending stopped after ${sent} recipients. ${message}` : message }, { status: 502 });
  }
}

async function getSubscribers(client: NonNullable<ReturnType<typeof createAdminClient>>) {
  const subscribers: SubscriberRecipient[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from("subscribers").select("id,name,email,unsubscribe_token").order("subscribed_at", { ascending: true }).range(from, from + 999);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as SubscriberRecipient[];
    subscribers.push(...page);
    if (page.length < 1000) return subscribers;
  }
}

async function resendError(response: Response) {
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  return payload?.message || "The email provider rejected the newsletter.";
}

function clean(value: unknown, limit: number) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}
