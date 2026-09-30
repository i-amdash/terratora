import { NextResponse } from "next/server";
import { cleanPayload, saveSubmission, sendNotification } from "@/lib/forms";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const payload = cleanPayload(input, ["first_name","last_name","email","organisation","preferred_date","preferred_time","timezone","session_type","message"]);
    const consent = typeof input?.consent === "string" ? input.consent : "";
    if (!payload.preferred_date || !payload.preferred_time || !payload.timezone || !payload.session_type) throw new Error("Please select a date, time, timezone, and service.");
    if (consent !== "accepted") throw new Error("Please confirm that you consent to us using your details for this booking.");
    try { new Intl.DateTimeFormat("en", { timeZone: payload.timezone }); } catch { throw new Error("Please select a valid timezone."); }
    await saveSubmission("bookings", payload);
    await sendNotification(`New Terratora session request from ${payload.first_name} ${payload.last_name}`, payload);
    return NextResponse.json({ ok:true });
  } catch (error) { return NextResponse.json({ error:error instanceof Error ? error.message : "Invalid request." }, { status:400 }); }
}
