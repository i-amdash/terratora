import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({error:"Unauthorised"},{status:401});
  const input = await request.json();
  const required = ["title","slug","excerpt","body","category","published_at","image_url","author_name"];
  if (required.some((field) => !input[field])) return NextResponse.json({error:"Complete every article field."},{status:400});
  const slug = String(input.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { error } = await client.from("posts").insert({ title:String(input.title).slice(0,200), slug, excerpt:String(input.excerpt).slice(0,500), body:String(input.body).slice(0,30000), category:String(input.category).slice(0,80), image_url:String(input.image_url).slice(0,1000), author_name:String(input.author_name).slice(0,120), author_avatar_url:String(input.author_avatar_url ?? "").slice(0,1000) || null, published_at:input.published_at, featured:Boolean(input.featured), published:true });
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  return NextResponse.json({ok:true});
}

export async function PUT(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({error:"Unauthorised"},{status:401});
  const input = await request.json();
  const required = ["title","slug","excerpt","body","category","published_at","image_url","author_name","original_slug"];
  if (required.some((field) => !input[field])) return NextResponse.json({error:"Complete every article field."},{status:400});
  const slug = String(input.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { error } = await client.from("posts").update({ title:String(input.title).slice(0,200), slug, excerpt:String(input.excerpt).slice(0,500), body:String(input.body).slice(0,30000), category:String(input.category).slice(0,80), image_url:String(input.image_url).slice(0,1000), author_name:String(input.author_name).slice(0,120), author_avatar_url:String(input.author_avatar_url ?? "").slice(0,1000) || null, published_at:input.published_at, featured:Boolean(input.featured), updated_at:new Date().toISOString() }).eq("slug",String(input.original_slug));
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  return NextResponse.json({ok:true});
}

export async function DELETE(request: Request) {
  if (!await requireAdmin()) return NextResponse.json({error:"Unauthorised"},{status:401});
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({error:"Missing article slug."},{status:400});
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { error } = await client.from("posts").delete().eq("slug",slug);
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  return NextResponse.json({ok:true});
}
