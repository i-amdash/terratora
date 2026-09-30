import { NextResponse } from "next/server";
import { cleanPayload, saveSubmission, sendNotification } from "@/lib/forms";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const payload = cleanPayload(input, ["first_name","last_name","email","organisation","interest","message"]);
    const consent = typeof input?.consent === "string" ? input.consent : "";
    if (consent !== "accepted") throw new Error("Please confirm that you consent to us using your details for this enquiry.");
    await saveSubmission("messages", payload);
    await sendNotification(`New Terratora enquiry from ${payload.first_name} ${payload.last_name}`, payload);
    return NextResponse.json({ ok:true });
  } catch (error) { return NextResponse.json({ error:error instanceof Error ? error.message : "Invalid request." }, { status:400 }); }
}
