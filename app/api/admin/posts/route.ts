import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!await requireAdmin("manage_publications")) return NextResponse.json({error:"Unauthorised"},{status:401});
  const input = await request.json();
  const published = Boolean(input.published);
  const required = ["title","slug","excerpt","body","category","published_at","image_url","author_id"];
  if (!input.title || !input.slug || (published && required.some((field) => !input[field]))) return NextResponse.json({error:published ? "Complete every article field before publishing." : "A draft needs at least a title and web address."},{status:400});
  const slug = String(input.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { data: author } = input.author_id ? await client.from("authors").select("id,name,avatar_url").eq("id",String(input.author_id)).maybeSingle() : { data: null };
  if (published && !author) return NextResponse.json({error:"Select a saved author."},{status:400});
  const { error } = await client.from("posts").insert({ title:String(input.title).slice(0,200), slug, excerpt:String(input.excerpt ?? "").slice(0,500), body:String(input.body ?? "").slice(0,30000), category:String(input.category || "Perspective").slice(0,80), image_url:String(input.image_url ?? "").slice(0,1000), author_id:author?.id ?? null, author_name:author?.name ?? "Terratora Editorial Team", author_avatar_url:author?.avatar_url ?? null, published_at:input.published_at || new Date().toISOString().slice(0,10), featured:Boolean(input.featured), published });
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ok:true});
}

export async function PUT(request: Request) {
  if (!await requireAdmin("manage_publications")) return NextResponse.json({error:"Unauthorised"},{status:401});
  const input = await request.json();
  const published = Boolean(input.published);
  const required = ["title","slug","excerpt","body","category","published_at","image_url","author_id","original_slug"];
  if (!input.title || !input.slug || !input.original_slug || (published && required.some((field) => !input[field]))) return NextResponse.json({error:published ? "Complete every article field before publishing." : "A draft needs at least a title and web address."},{status:400});
  const slug = String(input.slug).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { data: author } = input.author_id ? await client.from("authors").select("id,name,avatar_url").eq("id",String(input.author_id)).maybeSingle() : { data: null };
  if (published && !author) return NextResponse.json({error:"Select a saved author."},{status:400});
  const { error } = await client.from("posts").update({ title:String(input.title).slice(0,200), slug, excerpt:String(input.excerpt ?? "").slice(0,500), body:String(input.body ?? "").slice(0,30000), category:String(input.category || "Perspective").slice(0,80), image_url:String(input.image_url ?? "").slice(0,1000), author_id:author?.id ?? null, author_name:author?.name ?? "Terratora Editorial Team", author_avatar_url:author?.avatar_url ?? null, published_at:input.published_at || new Date().toISOString().slice(0,10), featured:Boolean(input.featured), published, updated_at:new Date().toISOString() }).eq("slug",String(input.original_slug));
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ok:true});
}

export async function DELETE(request: Request) {
  if (!await requireAdmin("manage_publications")) return NextResponse.json({error:"Unauthorised"},{status:401});
  const slug = new URL(request.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({error:"Missing article slug."},{status:400});
  const client = createAdminClient();
  if (!client) return NextResponse.json({error:"Supabase is not configured."},{status:503});
  const { error } = await client.from("posts").delete().eq("slug",slug);
  if (error) return NextResponse.json({error:error.message},{status:500});
  revalidatePath("/journal","layout");
  revalidatePath("/sitemap.xml");
  return NextResponse.json({ok:true});
}
