import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error:"Unauthorised" },{status:401});
  const content = await request.json();
  if (!content?.global || !content?.home || !content?.about || !content?.services || !content?.contact) return NextResponse.json({error:"The content structure is incomplete."},{status:400});
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { error } = await client.from("site_content").upsert({ id:"main", content, updated_at:new Date().toISOString() });
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/","layout");
  return NextResponse.json({ok:true});
}
