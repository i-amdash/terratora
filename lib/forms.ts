import { createAdminClient } from "./supabase/server";

export function cleanPayload(input: unknown, allowed: string[]) {
  if (!input || typeof input !== "object") throw new Error("Invalid request.");
  const source = input as Record<string, unknown>;
  const output: Record<string, string> = {};
  for (const key of allowed) {
    const value = source[key];
    if (typeof value === "string") output[key] = value.trim().slice(0, key === "message" ? 5000 : 300);
  }
  if (!output.email || !/^\S+@\S+\.\S+$/.test(output.email)) throw new Error("Please provide a valid email address.");
  if (!output.first_name || !output.last_name || !output.message) throw new Error("Please complete all required fields.");
  return output;
}

export async function saveSubmission(table: "messages" | "bookings", payload: Record<string, string>) {
  const client = createAdminClient();
  if (!client) throw new Error("The enquiry service is not configured yet. Please email us directly.");
  const { error } = await client.from(table).insert(payload);
  if (error) throw new Error("We could not save your request. Please try again.");
}

export async function sendNotification(subject: string, payload: Record<string, string>) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.NOTIFICATION_EMAIL;
  if (!key || !to) return;
  const html = `<div style="font-family:Arial,sans-serif;color:#05445E"><h1>${escapeHtml(subject)}</h1>${Object.entries(payload).map(([key,value]) => `<p><strong>${escapeHtml(key.replaceAll("_"," "))}</strong><br>${escapeHtml(value)}</p>`).join("")}</div>`;
  const response = await fetch("https://api.resend.com/emails", { method:"POST", headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json" }, body:JSON.stringify({ from:process.env.EMAIL_FROM || "Terratora <onboarding@resend.dev>", to:[to], reply_to:payload.email, subject, html }) });
  if (!response.ok) console.error("Notification email could not be sent", await response.text());
}

function escapeHtml(value: string) { return value.replace(/[&<>'"]/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"})[character]!); }
