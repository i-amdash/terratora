import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "@/components/icons";
import { Marquee } from "@/components/marquee";
import { ParallaxManifesto } from "@/components/parallax-manifesto";
import { HorizontalServices } from "@/components/horizontal-services";
import { getPosts, getSiteContent } from "@/lib/content";

export default async function Home() {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  const { home, services } = content;
  return (
    <>
      <section className="home-hero">
        <div className="hero-glow" aria-hidden="true" />
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span />{home.eyebrow}</p>
            <h1><span>{home.title}</span><em>{home.titleAccent}</em></h1>
          </div>
          <div className="hero-aside">
            <p>{home.intro}</p>
            <Link href="/about" className="text-link">Discover Terratora <ArrowRight /></Link>
          </div>
          <div className="scroll-cue"><span>Scroll to explore</span><i /></div>
        </div>
      </section>

      <section className="client-band">
        <div className="shell"><p>Trusted by teams at</p></div>
        <Marquee items={home.clients} />
      </section>

      <ParallaxManifesto manifesto={home.manifesto} />

      <HorizontalServices services={services} />

      <section className="impact-section">
        <div className="shell">
          <p className="section-index light">03 — In numbers</p>
          <div className="metrics">
            {home.metrics.map((metric) => <div key={metric.label} data-reveal><strong>{metric.value}</strong><span>{metric.label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="journal-preview">
        <div className="shell">
          <div className="section-heading journal-heading" data-reveal><div><p className="section-index">04 — Thinking out loud</p><h2>Ideas for the<br /><em>work ahead.</em></h2></div><Link className="text-link" href="/journal">View all thinking <ArrowRight /></Link></div>
          <div className="post-grid">
            {posts.slice(0, 3).map((post, index) => <Link href={`/journal/${post.slug}`} className={`post-card ${index === 0 ? "featured" : ""}`} key={post.slug} data-reveal><div className="post-art"><span>{index === 0 ? "↗" : index === 1 ? "◯" : "✦"}</span></div><p>{post.category} · {new Date(post.published_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p><h3>{post.title}</h3><span className="post-arrow"><ArrowUpRight /></span></Link>)}
          </div>
        </div>
      </section>
    </>
  );
}
