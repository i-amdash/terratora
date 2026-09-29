import { createClient } from "@supabase/supabase-js";

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

const content = {
  global: {
    email: "hello@terratora.com",
    phone: "+234 000 000 0000",
    location: "Lagos · London · Everywhere",
    announcement: "Now partnering with teams for Q1 2027",
  },
  home: {
    eyebrow: "Strategy · Transformation · Growth",
    title: "We turn difficult",
    titleAccent: "questions into momentum.",
    intro: "Terratora is the strategic partner for leaders navigating a world that refuses to stand still. We make complexity useful—and progress inevitable.",
    manifesto: "The future does not arrive fully formed. It is shaped by the people willing to question, test, and move with intention.",
    clients: ["BLOOM", "NORTH/01", "AFRICA NEXT", "MERIDIAN", "FOUNDARY", "NOVA"],
    metrics: [
      { value: "24+", label: "Organisations moved forward" },
      { value: "08", label: "Markets reached" },
      { value: "92%", label: "Client referral rate" },
    ],
  },
  about: {
    eyebrow: "About Terratora",
    title: "Built for the space between ambition and action.",
    intro: "We are a modern advisory studio for organisations at an inflection point.",
    body: "Terratora brings strategy, design, and delivery into one room. We partner closely with decision-makers to find the signal inside the noise, align people around it, and build the systems that make change stick. No theatre. No off-the-shelf playbooks. Just thoughtful work, made together.",
    principles: [
      { number: "01", title: "Clarity is a catalyst", text: "The right question can unlock a room. We create the conditions for honest thinking and decisive movement." },
      { number: "02", title: "Make with, not for", text: "The best answer is rarely delivered from a distance. We work inside the problem, alongside the people who own it." },
      { number: "03", title: "Useful over impressive", text: "A strategy matters when people can use it. Our work is rigorous, beautiful, and built to survive contact with reality." },
    ],
  },
  services: {
    eyebrow: "What we do",
    title: "From first question to lasting change.",
    intro: "Our engagements are shaped around your moment—not a fixed methodology. We bring the right combination of challenge, craft, and momentum.",
    items: [
      { number: "01", title: "Strategy & Direction", summary: "Make the big choices with confidence. We clarify where to play, how to win, and what matters now.", deliverables: ["Corporate & growth strategy", "Market intelligence", "Strategic narratives", "Operating roadmaps"] },
      { number: "02", title: "Brand & Experience", summary: "Turn what you believe into an experience people can feel, trust, and choose.", deliverables: ["Brand strategy", "Customer experience", "Proposition design", "Innovation sprints"] },
      { number: "03", title: "Organisation & Change", summary: "Move people, structures, and culture in the same direction—without losing what makes you, you.", deliverables: ["Operating model design", "Leadership alignment", "Change programmes", "Culture activation"] },
      { number: "04", title: "Labs & Facilitation", summary: "Create focused space for your team to solve what day-to-day work keeps pushing aside.", deliverables: ["Executive offsites", "Decision labs", "Team workshops", "Custom learning"] },
    ],
  },
  contact: {
    eyebrow: "Start a conversation",
    title: "Bring us the question that keeps returning.",
    intro: "Tell us where you are, what is changing, and what a meaningful next step would look like. We will respond within two working days.",
  },
};

const posts = [
  { slug: "strategy-needs-friction", title: "Good strategy needs friction", excerpt: "Consensus feels productive. Constructive tension is what gets you somewhere new.", body: "The strongest strategies rarely begin with agreement. They begin when a team is willing to name the choices it has avoided.\n\nConstructive friction is not conflict for its own sake. It is the discipline of holding two plausible futures in view long enough to understand what each demands—and what each makes impossible.\n\nCreate room for dissent early. Separate ideas from hierarchy. Ask what would have to be true. Then turn the tension into a decision people can act on.", category: "Perspective", published_at: "2026-08-18", featured: true, published: true },
  { slug: "change-is-a-design-problem", title: "Change is a design problem", excerpt: "Transformation fails when it is announced as a destination instead of designed as a daily experience.", body: "Most transformation plans are articulate about the destination and vague about Tuesday morning. That gap is where momentum disappears.\n\nTreat change as an experience. What will people see, hear, decide, and do differently? Which systems reinforce the old behaviour? What is the smallest visible proof that a new way is working?\n\nChange becomes believable when it becomes tangible.", category: "Field note", published_at: "2026-07-04", featured: false, published: true },
  { slug: "the-value-of-not-knowing", title: "The value of not knowing", excerpt: "In uncertain markets, the quality of your learning loop matters more than the certainty of your plan.", body: "A confident plan can be comforting, especially when the conditions around it are moving. But certainty is often the wrong ambition.\n\nBuild a point of view, make its assumptions visible, and design a fast way to test them. The organisation that learns with discipline will outpace the one that predicts with confidence.", category: "Briefing", published_at: "2026-05-22", featured: false, published: true },
];

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
