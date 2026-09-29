"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "./icons";

type FormState = "idle" | "sending" | "success" | "error";

function Field({ label, name, type = "text", required = true, placeholder = "" }: { label: string; name: string; type?: string; required?: boolean; placeholder?: string }) {
  return <label className="field"><span>{label}{required && " *"}</span><input name={name} type={type} required={required} placeholder={placeholder} /></label>;
}

export function ContactForm({ booking = false }: { booking?: boolean }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

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
      setMessage(booking ? "Your request is in. We’ll confirm a time by email shortly." : "Message received. We’ll be in touch within two working days.");
      form.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="field-row"><Field label="First name" name="first_name" /><Field label="Last name" name="last_name" /></div>
      <div className="field-row"><Field label="Work email" name="email" type="email" /><Field label="Organisation" name="organisation" required={false} /></div>
      {booking ? (
        <>
          <div className="field-row"><Field label="Preferred date" name="preferred_date" type="date" /><Field label="Preferred time" name="preferred_time" type="time" /></div>
          <label className="field"><span>What would you like to explore? *</span><select name="session_type" required defaultValue=""><option value="" disabled>Select a session</option><option>Strategy clarity call</option><option>Leadership alignment session</option><option>Transformation diagnostic</option><option>Something else</option></select></label>
        </>
      ) : (
        <label className="field"><span>How can we help? *</span><select name="interest" required defaultValue=""><option value="" disabled>Select an area</option><option>Strategy & direction</option><option>Brand & experience</option><option>Organisation & change</option><option>Labs & facilitation</option><option>Something else</option></select></label>
      )}
      <label className="field"><span>{booking ? "A little context" : "Your message"} *</span><textarea name="message" rows={5} required placeholder="What are you working through?" /></label>
      <div className="form-submit">
        <p>By submitting, you agree to our privacy policy.</p>
        <button className="button button-dark" disabled={state === "sending"}>{state === "sending" ? "Sending…" : booking ? "Request session" : "Send message"}<ArrowRight /></button>
      </div>
      {message && <p className={`form-status ${state}`}>{message}</p>}
    </form>
  );
}
