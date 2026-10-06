import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  try {
    if (!await requireAdmin()) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    const client = createAdminClient();
    if (!client) return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });

    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose an image to upload." }, { status: 400 });
    if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Only JPEG, PNG and WebP images are supported." }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "The image must be smaller than 8 MB." }, { status: 400 });

    const { data: bucket } = await client.storage.getBucket("media");
    if (!bucket) {
      const { error: bucketError } = await client.storage.createBucket("media", {
        public: true,
        fileSizeLimit: 8 * 1024 * 1024,
        allowedMimeTypes: [...allowedTypes],
      });
      if (bucketError && !bucketError.message.toLowerCase().includes("already exists")) {
        return NextResponse.json({ error: bucketError.message }, { status: 500 });
      }
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `uploads/${new Date().toISOString().slice(0, 10)}/${randomUUID()}.${extension}`;
    const { error } = await client.storage.from("media").upload(path, file, { contentType: file.type, upsert: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const { data: publicUrl } = client.storage.from("media").getPublicUrl(path);
    return NextResponse.json({ url: publicUrl.publicUrl });
  } catch (error) {
    console.error("Admin media upload failed", error);
    return NextResponse.json({ error: "The upload service could not process this image." }, { status: 500 });
  }
}
