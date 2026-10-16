import "server-only";
import type { createAdminClient } from "@/lib/supabase/server";
import { absoluteUrl } from "@/lib/site-url";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;
type ResendResult = { id: string };

export async function prepareNewsletterAudience(client: AdminClient) {
  const segmentId = await ensureNewsletterSegment(client);
  await ensureUnsubscribeProperty();
  const subscribers = await allSubscribers(client);
  for (let offset = 0; offset < subscribers.length; offset += 10) {
    await Promise.all(subscribers.slice(offset, offset + 10).map((subscriber) => syncContact(subscriber, segmentId)));
  }
  return { segmentId, recipientCount: subscribers.length };
}

export async function createResendBroadcast(input: { segmentId: string; subject: string; html: string; text: string; scheduledAt?: string }) {
  return resendRequest<ResendResult>("/broadcasts", {
    method: "POST",
    body: JSON.stringify({ segment_id: input.segmentId, from: process.env.EMAIL_FROM, subject: input.subject, html: input.html, text: input.text, send: true, ...(input.scheduledAt ? { scheduled_at: input.scheduledAt } : {}) }),
  });
}

export async function discardResendBroadcast(id: string, scheduled = false) {
  if (scheduled) {
    const cancel = await rawResend(`/broadcasts/${encodeURIComponent(id)}/cancel`, { method: "POST" });
    if (!cancel.ok && cancel.status !== 404 && cancel.status !== 409) throw new Error(await responseError(cancel));
  }
  const remove = await rawResend(`/broadcasts/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!remove.ok && remove.status !== 404) throw new Error(await responseError(remove));
}

export async function removeResendContact(client: AdminClient, email: string) {
  if (!process.env.RESEND_API_KEY) return;
  const configured = process.env.RESEND_SEGMENT_ID || (await client.from("newsletter_settings").select("resend_segment_id").eq("id", "main").maybeSingle()).data?.resend_segment_id;
  if (!configured) return;
  const response = await rawResend(`/contacts/${encodeURIComponent(email)}`, { method: "DELETE" });
  if (!response.ok && response.status !== 404) throw new Error(await responseError(response));
}

async function ensureNewsletterSegment(client: AdminClient) {
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) throw new Error("Configure RESEND_API_KEY and EMAIL_FROM before sending newsletters.");
  if (process.env.RESEND_SEGMENT_ID) return process.env.RESEND_SEGMENT_ID;
  const { data, error } = await client.from("newsletter_settings").select("resend_segment_id").eq("id", "main").maybeSingle();
  if (error) throw new Error("Apply the admin workflows migration before scheduling newsletters.");
  if (data?.resend_segment_id) return String(data.resend_segment_id);
  const segment = await resendRequest<ResendResult>("/segments", { method: "POST", body: JSON.stringify({ name: "Terratora Subscribers" }) });
  const { error: saveError } = await client.from("newsletter_settings").upsert({ id: "main", resend_segment_id: segment.id, updated_at: new Date().toISOString() });
  if (saveError) throw new Error(saveError.message);
  return segment.id;
}

async function ensureUnsubscribeProperty() {
  const response = await rawResend("/contact-properties", { method: "POST", body: JSON.stringify({ key: "unsubscribe_url", type: "string", fallback_value: absoluteUrl("/unsubscribe") }) });
  if (!response.ok && response.status !== 409) throw new Error(await responseError(response));
}

async function syncContact(subscriber: { name: string; email: string; unsubscribe_token: string }, segmentId: string) {
  const nameParts = subscriber.name.trim().split(/\s+/);
  const payload = { email: subscriber.email, first_name: nameParts[0] || subscriber.name, last_name: nameParts.slice(1).join(" "), unsubscribed: false, properties: { unsubscribe_url: absoluteUrl(`/unsubscribe?token=${encodeURIComponent(subscriber.unsubscribe_token)}`) }, segments: [{ id: segmentId }] };
  const create = await rawResend("/contacts", { method: "POST", body: JSON.stringify(payload) });
  if (create.ok) return;
  if (create.status !== 409) throw new Error(await responseError(create));
  const email = encodeURIComponent(subscriber.email);
  const update = await rawResend(`/contacts/${email}`, { method: "PATCH", body: JSON.stringify({ unsubscribed: false, properties: payload.properties }) });
  if (!update.ok) throw new Error(await responseError(update));
  const add = await rawResend(`/contacts/${email}/segments/${encodeURIComponent(segmentId)}`, { method: "POST" });
  if (!add.ok && add.status !== 409) throw new Error(await responseError(add));
}

async function allSubscribers(client: AdminClient) {
  const result: { name: string; email: string; unsubscribe_token: string }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await client.from("subscribers").select("name,email,unsubscribe_token").order("subscribed_at", { ascending: true }).range(from, from + 999);
    if (error) throw new Error(error.message);
    const page = (data ?? []) as typeof result;
    result.push(...page);
    if (page.length < 1000) return result;
  }
}

async function resendRequest<T = unknown>(path: string, init: RequestInit) {
  const response = await rawResend(path, init);
  if (!response.ok) throw new Error(await responseError(response));
  return await response.json() as T;
}

async function rawResend(path: string, init: RequestInit) {
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not configured.");
  return fetch(`https://api.resend.com${path}`, { ...init, headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json", ...init.headers } });
}

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null) as { message?: string } | null;
  return payload?.message || `Resend request failed (${response.status}).`;
}
