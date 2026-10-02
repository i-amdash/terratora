import Link from "next/link";
import { ArrowRight } from "@/components/icons";
import { HeroCarousel } from "@/components/hero-carousel";
import { Marquee } from "@/components/marquee";
import { ParallaxManifesto } from "@/components/parallax-manifesto";
import { HorizontalServices } from "@/components/horizontal-services";
import { OrganisationCarousel } from "@/components/organisation-carousel";
import { getPosts, getSiteContent } from "@/lib/content";

export default async function Home() {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  const { home, services } = content;
  return (
    <>
      <HeroCarousel home={home} />

      <section className="client-band" data-color-flow="clear">
        <div className="shell client-band-heading"><p>Our client landscape</p><p>{home.clientIntro}</p></div>
        <Marquee items={home.clients} />
      </section>

      <ParallaxManifesto manifesto={home.manifesto} />

      <HorizontalServices services={services} />

      {home.organisations.length > 0 && <OrganisationCarousel organisations={home.organisations} />}

      <section className="home-cta" data-color-flow="aqua">
        <div className="shell home-cta-grid" data-reveal>
          <p className="section-index">Your next step</p>
          <div><h2>{home.ctaTitle}</h2><p>{home.ctaText}</p><Link className="button button-dark" href="/contact">Start a conversation <ArrowRight /></Link></div>
        </div>
      </section>

      <section className="journal-preview" data-color-flow="warm">
        <div className="shell">
          <div className="section-heading journal-heading" data-reveal><div><p className="section-index">Publications</p><h2>Ideas for the<br /><em>work ahead.</em></h2></div><Link className="text-link" href="/journal">View all publications <ArrowRight /></Link></div>
          <div className="post-grid">
            {posts.slice(0, 3).map((post, index) => <Link href={`/journal/${post.slug}`} className={`post-card ${index === 0 ? "featured" : ""}`} key={post.slug} data-reveal><div className="post-art">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={post.image_url || "/images/hero/reporting.jpg"} alt="" /></div><p>{post.category} · {new Date(post.published_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</p><h3>{post.title}</h3><span className="post-arrow"><ArrowRight /></span></Link>)}
          </div>
        </div>
      </section>
    </>
  );
}
