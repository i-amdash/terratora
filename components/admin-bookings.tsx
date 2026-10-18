"use client";

import { useState } from "react";
import type { AdminBooking } from "@/lib/types";
import { timezoneLabel } from "@/lib/timezones";
import { AdminDataTools, exportExcel, isWithinDate } from "./admin-data-tools";

export function AdminBookings({ initialBookings, onNotice }: { initialBookings: AdminBooking[]; onNotice: (message: string) => void }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [drafts, setDrafts] = useState<Record<string, { status: AdminBooking["status"]; scheduled_at: string }>>(() => Object.fromEntries(initialBookings.map((booking) => [booking.id, { status: booking.status, scheduled_at: toLocalInput(booking.scheduled_at) }])));
  const [dateFrom, setDateFrom] = useState(""); const [dateTo, setDateTo] = useState(""); const [busy, setBusy] = useState<string | null>(null);
  const filtered = bookings.filter((booking) => isWithinDate(booking.created_at, dateFrom, dateTo));

  async function save(booking: AdminBooking) {
    const draft = drafts[booking.id];
    if ((draft.status === "scheduled" || draft.status === "completed") && !draft.scheduled_at) { onNotice("Select the confirmed session date and time first."); return; }
    setBusy(booking.id);
    const response = await fetch("/api/admin/bookings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: booking.id, status: draft.status, scheduled_at: draft.scheduled_at ? new Date(draft.scheduled_at).toISOString() : null }) });
    const result = await response.json().catch(() => ({})); setBusy(null);
    if (!response.ok) { onNotice(result.error || "Booking could not be updated."); return; }
    setBookings((current) => current.map((item) => item.id === booking.id ? result : item));
    setDrafts((current) => ({ ...current, [booking.id]: { status: result.status, scheduled_at: toLocalInput(result.scheduled_at) } }));
    onNotice(result.status === "scheduled" ? "Booking scheduled." : result.status === "completed" ? "Booking marked as completed." : "Booking status updated.");
  }

  return <section><header className="publication-manager-head"><div><p className="eyebrow">Session requests</p><h2>Bookings</h2><p>Confirm an actual session time, then track each booking through completion.</p></div></header><AdminDataTools from={dateFrom} to={dateTo} onFromChange={setDateFrom} onToChange={setDateTo} onClear={() => { setDateFrom(""); setDateTo(""); }} count={filtered.length} onExport={() => exportExcel("terratora-bookings", filtered)} /><div className="workflow-list">{filtered.map((booking) => { const draft = drafts[booking.id] || { status: booking.status, scheduled_at: toLocalInput(booking.scheduled_at) }; return <article className="workflow-card booking-workflow-card" key={booking.id}><header><div><strong>{booking.first_name} {booking.last_name}</strong><small>{booking.email}{booking.organisation ? ` · ${booking.organisation}` : ""}</small></div><span className={`workflow-status ${booking.status}`}>{booking.status}</span></header><div className="booking-request-details"><div><span>Requested service</span><strong>{booking.session_type}</strong></div><div><span>Preferred time</span><strong>{new Date(`${booking.preferred_date}T${booking.preferred_time}`).toLocaleDateString("en-GB", { dateStyle: "medium" })} · {booking.preferred_time.slice(0, 5)}</strong></div><div><span>Timezone</span><strong>{timezoneLabel(booking.timezone || "Africa/Lagos")}</strong></div></div><p>{booking.message}</p><div className="booking-schedule-controls"><label><span>Status</span><select value={draft.status} onChange={(event) => setDrafts((current) => ({ ...current, [booking.id]: { ...draft, status: event.target.value as AdminBooking["status"] } }))}><option value="pending">Pending</option><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label><label><span>Confirmed session date and time</span><input type="datetime-local" value={draft.scheduled_at} onChange={(event) => setDrafts((current) => ({ ...current, [booking.id]: { ...draft, scheduled_at: event.target.value } }))} /></label><button type="button" className="button button-dark" disabled={busy === booking.id} onClick={() => void save(booking)}>{busy === booking.id ? "Saving…" : "Save booking"}</button></div>{booking.scheduled_at && <p className="confirmed-session"><strong>Confirmed:</strong> {new Date(booking.scheduled_at).toLocaleString("en-GB", { dateStyle: "full", timeStyle: "short" })} · {timezoneLabel(booking.timezone || "Africa/Lagos", new Date(booking.scheduled_at))}</p>}<footer><a href={`mailto:${booking.email}`}>Email attendee ↗</a></footer></article>; })}{!filtered.length && <div className="empty-state">No bookings match this date range.</div>}</div></section>;
}

function toLocalInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}
