"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowRight } from "./icons";

type FormState = "idle" | "sending" | "success" | "error";

const serviceOptions = [
  "ESG Readiness Assessment",
  "ESG Reporting Advisory",
  "Supply Chain Evaluation",
  "Governance and Internal Controls Review",
  "Implementation Support",
  "Board-Level Training",
  "Sustainability Training",
];

const fallbackTimezones = [
  "Africa/Lagos",
  "Africa/Accra",
  "Africa/Johannesburg",
  "Europe/London",
  "Europe/Paris",
  "Asia/Dubai",
  "Asia/Singapore",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
];

function timezoneLabel(timezone: string) {
  try {
    const offset = new Intl.DateTimeFormat("en", { timeZone: timezone, timeZoneName: "shortOffset" })
      .formatToParts(new Date())
      .find((part) => part.type === "timeZoneName")?.value;
    return `${timezone.replaceAll("_", " ")}${offset ? ` (${offset})` : ""}`;
  } catch {
    return timezone;
  }
}

function Field({ label, name, type = "text", required = true, placeholder = "" }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}{required && " *"}</span><input name={name} type={type} required={required} placeholder={placeholder} /></label>;
}

export function ContactForm({ booking = false }: { booking?: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [timezone, setTimezone] = useState("Africa/Lagos");
  const [timezones, setTimezones] = useState(fallbackTimezones);

  useEffect(() => {
    if (!booking) return;
    const intl = Intl as typeof Intl & { supportedValuesOf?: (key: "timeZone") => string[] };
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone || "Africa/Lagos";
    const supported = intl.supportedValuesOf?.("timeZone") ?? fallbackTimezones;
    setTimezones(Array.from(new Set([detected, "Africa/Lagos", ...supported])));
    setTimezone(detected);
  }, [booking]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    try {
      const response = await fetch(booking ? "/api/bookings" : "/api/contact", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      setState("success");
      setMessage(booking ? "Your request is in. We’ll confirm a time by email shortly." : "Message received. Thank you for contacting Terratora.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-row"><Field label="First name" name="first_name" /><Field label="Last name" name="last_name" /></div>
      <div className="field-row"><Field label="Email" name="email" type="email" /><Field label="Organisation" name="organisation" required={false} /></div>
      {booking ? (
        <>
          <div className="field-row"><Field label="Preferred date" name="preferred_date" type="date" /><Field label="Preferred time" name="preferred_time" type="time" /></div>
          <label className="field"><span>Your timezone *</span><select name="timezone" required value={timezone} onChange={(event) => setTimezone(event.target.value)}>{timezones.map((zone) => <option value={zone} key={zone}>{timezoneLabel(zone)}</option>)}</select><small className="field-help">We use this to interpret your preferred time correctly.</small></label>
          <label className="field"><span>What would you like to explore? *</span><select name="session_type" required defaultValue=""><option value="" disabled>Select a service</option>{serviceOptions.map((service) => <option value={service} key={service}>{service}</option>)}<option>Something else</option></select></label>
        </>
      ) : (
        <label className="field"><span>How can we help? *</span><select name="interest" required defaultValue=""><option value="" disabled>Select a service</option>{serviceOptions.map((service) => <option value={service} key={service}>{service}</option>)}<option>Something else</option></select></label>
      )}
      <label className="field"><span>{booking ? "A little context" : "Your message"} *</span><textarea name="message" rows={5} required placeholder="What are you working through?" /></label>
      <div className="form-submit">
        <button className="button button-dark" disabled={state === "sending"}>{state === "sending" ? "Sending…" : booking ? "Request session" : "Send message"}<ArrowRight /></button>
      </div>
      <label className="consent-field"><input name="consent" type="checkbox" value="accepted" required /><span>By submitting this form, you agree to let us process your personal information solely to respond to your inquiry/request. We rely on our legitimate interest to address customer inquiries. For more details on your rights under the NDPA and how we process your information, please view our full <Link href="/privacy">Privacy Policy</Link>.</span></label>
      {message && <p className={`form-status ${state}`}>{message}</p>}
    </form>
  );
}
