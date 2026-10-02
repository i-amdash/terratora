import Link from "next/link";

type Crumb = { label: string; href?: string };

export function PageHero({
  eyebrow,
  title,
  lede,
  image,
  imagePosition = "center",
  crumbs,
}: {
  eyebrow: string;
  title: string;
  lede?: string;
  image: string;
  imagePosition?: string;
  crumbs: Crumb[];
}) {
  return (
    <section className="page-hero image-page-hero" data-color-flow="deep">
      <div className="page-hero-media" aria-hidden="true">
        {/* Page imagery may come from the editor's Supabase media library. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" style={{ objectFit: "cover", objectPosition: imagePosition }} />
      </div>
      <div className="page-hero-shade" aria-hidden="true" />
      <div className="shell page-hero-content">
        <nav className="breadcrumbs" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            {crumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`}>
                <span aria-hidden="true">/</span>
                {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        <div className="page-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {lede && <p className="lede">{lede}</p>}
        </div>
      </div>
    </section>
  );
}
