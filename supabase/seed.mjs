import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

class UnusedRealtimeTransport {
  constructor() {
    throw new Error("Realtime is not available in the database seeder");
  }
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
  realtime: { transport: UnusedRealtimeTransport },
});

const content = JSON.parse(readFileSync(new URL("../content/site-content.json", import.meta.url), "utf8"));
const posts = JSON.parse(readFileSync(new URL("../content/posts.json", import.meta.url), "utf8"));

async function seed() {
  console.log("Seeding Terratora CMS…");

  const { error: contentError } = await supabase
    .from("site_content")
    .upsert({ id: "main", content, updated_at: new Date().toISOString() });
  if (contentError) throw new Error(`site_content: ${contentError.message}`);
  console.log("✓ Site content upserted");

  const { error: postsError } = await supabase
    .from("posts")
    .upsert(posts, { onConflict: "slug" });
  if (postsError) throw new Error(`posts: ${postsError.message}`);
  console.log(`✓ ${posts.length} journal posts upserted`);

  if (process.env.ADMIN_EMAIL) {
    const { data, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw new Error(`auth users: ${usersError.message}`);
    const adminEmail = process.env.ADMIN_EMAIL.toLowerCase();
    let admin = data.users.find((user) => user.email?.toLowerCase() === adminEmail);
    if (!admin) {
      if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD.length < 8) {
        throw new Error("ADMIN_EMAIL has no Auth account. Set ADMIN_PASSWORD (at least 8 characters) to create it.");
      }
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        email_confirm: true,
      });
      if (createError) throw new Error(`create admin: ${createError.message}`);
      admin = created.user;
      console.log("✓ Admin Auth account created");
    }
    const { error: adminError } = await supabase.from("admin_users").upsert({ user_id: admin.id });
    if (adminError) throw new Error(`admin_users: ${adminError.message}`);
    console.log("✓ Admin user promoted");
  } else {
    console.log("• ADMIN_EMAIL not set; skipped admin promotion");
  }

  const [{ count: contentCount }, { count: postCount }] = await Promise.all([
    supabase.from("site_content").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
  ]);
  console.log(`Seed complete: ${contentCount ?? 0} content document(s), ${postCount ?? 0} post(s).`);
}

seed().catch((error) => {
  console.error(`Seed failed: ${error.message}`);
  process.exit(1);
});
