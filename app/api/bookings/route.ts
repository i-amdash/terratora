import { NextResponse } from "next/server";
import { cleanPayload, saveSubmission, sendNotification } from "@/lib/forms";

export async function POST(request: Request) {
  try {
    const payload = cleanPayload(await request.json(), ["first_name","last_name","email","organisation","preferred_date","preferred_time","session_type","message"]);
    if (!payload.preferred_date || !payload.preferred_time || !payload.session_type) throw new Error("Please select a date, time, and session type.");
    await saveSubmission("bookings", payload);
    await sendNotification(`New Terratora session request from ${payload.first_name} ${payload.last_name}`, payload);
    return NextResponse.json({ ok:true });
  } catch (error) { return NextResponse.json({ error:error instanceof Error ? error.message : "Invalid request." }, { status:400 }); }
}
