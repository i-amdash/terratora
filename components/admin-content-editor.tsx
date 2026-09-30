"use client";

import Image from "next/image";
import { useState } from "react";
import type { SiteContent } from "@/lib/types";

type Section = "business" | "homepage" | "about" | "services" | "contact";

const sections: { id: Section; label: string; description: string }[] = [
  { id: "business", label: "Business details", description: "Email, service area and site-wide information" },
  { id: "homepage", label: "Homepage", description: "Hero, carousel, sectors and headline figures" },
  { id: "about", label: "About us", description: "Company story and guiding principles" },
  { id: "services", label: "Services", description: "Service descriptions and deliverables" },
  { id: "contact", label: "Contact page", description: "Contact page heading and introduction" },
];

const imageOptions = [
  ["/images/hero/global-markets.jpg", "Globe in nature"],
  ["/images/hero/sustainable-business.jpg", "Sustainable office building"],
  ["/images/hero/reporting.jpg", "Reporting document"],
  ["/images/hero/operations.jpg", "Manufacturing operations"],
  ["/images/hero/supply-chain.jpg", "Supply-chain containers"],
  ["/images/hero/governance.jpg", "Boardroom and governance"],
] as const;

export function AdminContentEditor({
  value,
  onChange,
  onSave,
}: {
  value: SiteContent;
  onChange: (value: SiteContent) => void;
  onSave: () => void;
}) {
  const [section, setSection] = useState<Section>("business");

  return (
    <div className="content-manager">
      <aside className="content-sections" aria-label="Website content sections">
        <div>
          <p className="eyebrow">Website content</p>
          <h2>Choose a page to edit</h2>
          <p>Changes appear on the website after you select “Publish changes”.</p>
        </div>
        <nav>
          {sections.map((item, index) => (
            <button type="button" className={section === item.id ? "active" : ""} onClick={() => setSection(item.id)} key={item.id}>
              <span>0{index + 1}</span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>
      </aside>

      <div className="content-editor-form">
        {section === "business" && <BusinessEditor value={value} onChange={onChange} />}
        {section === "homepage" && <HomeEditor value={value} onChange={onChange} />}
        {section === "about" && <AboutEditor value={value} onChange={onChange} />}
        {section === "services" && <ServicesEditor value={value} onChange={onChange} />}
        {section === "contact" && <ContactEditor value={value} onChange={onChange} />}
        <div className="content-save-bar">
          <p>Your edits remain drafts until they are published.</p>
          <button type="button" className="button button-dark" onClick={onSave}>Publish changes →</button>
        </div>
      </div>
    </div>
  );
}

function EditorHeading({ title, description }: { title: string; description: string }) {
  return <header className="content-editor-heading"><p className="eyebrow">Content editor</p><h2>{title}</h2><p>{description}</p></header>;
}

function TextField({ label, value, onChange, hint, multiline = false }: { label: string; value: string; onChange: (value: string) => void; hint?: string; multiline?: boolean }) {
  return <label className="cms-field"><span>{label}</span>{hint && <small>{hint}</small>}{multiline ? <textarea rows={5} value={value} onChange={(event) => onChange(event.target.value)} /> : <input value={value} onChange={(event) => onChange(event.target.value)} />}</label>;
}

function BusinessEditor({ value, onChange }: EditorProps) {
  return <>
    <EditorHeading title="Business details" description="These details are reused in the footer and contact areas of the website." />
    <div className="cms-panel cms-form-grid">
      <TextField label="Contact email" hint="Messages and enquiries are directed here." value={value.global.email} onChange={(email) => onChange({ ...value, global: { ...value.global, email } })} />
      <TextField label="Phone number" hint="Optional. Leave blank to hide it from the website." value={value.global.phone} onChange={(phone) => onChange({ ...value, global: { ...value.global, phone } })} />
      <TextField label="Where we work" value={value.global.location} onChange={(location) => onChange({ ...value, global: { ...value.global, location } })} />
      <TextField label="Short announcement" value={value.global.announcement} onChange={(announcement) => onChange({ ...value, global: { ...value.global, announcement } })} />
    </div>
  </>;
}

function HomeEditor({ value, onChange }: EditorProps) {
  const updateHome = (changes: Partial<SiteContent["home"]>) => onChange({ ...value, home: { ...value.home, ...changes } });
  return <>
    <EditorHeading title="Homepage" description="Edit the main message, carousel and the information visitors see first." />
    <div className="cms-panel cms-form-grid">
      <TextField label="Small heading above the title" value={value.home.eyebrow} onChange={(eyebrow) => updateHome({ eyebrow })} />
      <TextField label="Main headline" value={value.home.title} onChange={(title) => updateHome({ title })} />
      <TextField label="Accent headline" hint="Shown in the italic display typeface." value={value.home.titleAccent} onChange={(titleAccent) => updateHome({ titleAccent })} />
      <TextField label="Hero introduction" value={value.home.intro} onChange={(intro) => updateHome({ intro })} multiline />
      <div className="cms-field-full"><TextField label="Manifesto statement" value={value.home.manifesto} onChange={(manifesto) => updateHome({ manifesto })} multiline /></div>
      <div className="cms-field-full"><TextField label="Client-sector introduction" value={value.home.clientIntro} onChange={(clientIntro) => updateHome({ clientIntro })} multiline /></div>
      <TextField label="Closing call-to-action title" value={value.home.ctaTitle} onChange={(ctaTitle) => updateHome({ ctaTitle })} />
      <TextField label="Closing call-to-action text" value={value.home.ctaText} onChange={(ctaText) => updateHome({ ctaText })} multiline />
    </div>

    <CollectionHeader title="Carousel slides" description="Choose an approved image and edit the short message shown with it." onAdd={() => updateHome({ heroSlides: [...value.home.heroSlides, { image: imageOptions[0][0], position: "50% 50%", label: "New slide", caption: "Add a short, clear caption." }] })} />
    <div className="cms-card-list">
      {value.home.heroSlides.map((slide, index) => <article className="cms-repeat-card hero-slide-editor" key={`${slide.image}-${index}`}>
        <div className="cms-image-preview"><Image src={slide.image} alt="" fill sizes="240px" style={{ objectFit: "cover", objectPosition: slide.position }} /></div>
        <div className="cms-repeat-content">
          <div className="cms-repeat-heading"><strong>Slide {index + 1}</strong><RemoveButton onClick={() => updateHome({ heroSlides: value.home.heroSlides.filter((_, itemIndex) => itemIndex !== index) })} /></div>
          <label className="cms-field"><span>Image</span><select value={slide.image} onChange={(event) => updateHome({ heroSlides: value.home.heroSlides.map((item, itemIndex) => itemIndex === index ? { ...item, image: event.target.value } : item) })}>{imageOptions.map(([path, label]) => <option value={path} key={path}>{label}</option>)}</select></label>
          <div className="cms-form-grid compact">
            <TextField label="Slide label" value={slide.label} onChange={(label) => updateHome({ heroSlides: value.home.heroSlides.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item) })} />
            <label className="cms-field"><span>Image focus</span><select value={slide.position} onChange={(event) => updateHome({ heroSlides: value.home.heroSlides.map((item, itemIndex) => itemIndex === index ? { ...item, position: event.target.value } : item) })}><option value="50% 50%">Centre</option><option value="50% 30%">Top</option><option value="50% 70%">Bottom</option><option value="35% 50%">Left</option><option value="65% 50%">Right</option><option value="38% 64%">Lower left</option></select></label>
          </div>
          <TextField label="Caption" value={slide.caption} onChange={(caption) => updateHome({ heroSlides: value.home.heroSlides.map((item, itemIndex) => itemIndex === index ? { ...item, caption } : item) })} multiline />
        </div>
      </article>)}
    </div>

    <CollectionHeader title="Client sectors" description="The sectors shown in the scrolling band beneath the hero." onAdd={() => updateHome({ clients: [...value.home.clients, "New sector"] })} />
    <div className="cms-panel cms-inline-list">{value.home.clients.map((client, index) => <div key={`${client}-${index}`}><input aria-label={`Client sector ${index + 1}`} value={client} onChange={(event) => updateHome({ clients: value.home.clients.map((item, itemIndex) => itemIndex === index ? event.target.value : item) })} /><RemoveButton onClick={() => updateHome({ clients: value.home.clients.filter((_, itemIndex) => itemIndex !== index) })} /></div>)}</div>

    <CollectionHeader title="Headline figures" description="Short figures and labels used in the ‘In numbers’ section." onAdd={() => updateHome({ metrics: [...value.home.metrics, { value: "00", label: "New figure" }] })} />
    <div className="cms-panel cms-metric-grid">{value.home.metrics.map((metric, index) => <article key={`${metric.label}-${index}`}><div className="cms-repeat-heading"><strong>Figure {index + 1}</strong><RemoveButton onClick={() => updateHome({ metrics: value.home.metrics.filter((_, itemIndex) => itemIndex !== index) })} /></div><TextField label="Value" value={metric.value} onChange={(metricValue) => updateHome({ metrics: value.home.metrics.map((item, itemIndex) => itemIndex === index ? { ...item, value: metricValue } : item) })} /><TextField label="Description" value={metric.label} onChange={(label) => updateHome({ metrics: value.home.metrics.map((item, itemIndex) => itemIndex === index ? { ...item, label } : item) })} /></article>)}</div>
  </>;
}

function AboutEditor({ value, onChange }: EditorProps) {
  const updateAbout = (changes: Partial<SiteContent["about"]>) => onChange({ ...value, about: { ...value.about, ...changes } });
  return <>
    <EditorHeading title="About us" description="Manage the company introduction and the principles listed on the About page." />
    <div className="cms-panel cms-form-grid">
      <TextField label="Small page heading" value={value.about.eyebrow} onChange={(eyebrow) => updateAbout({ eyebrow })} />
      <TextField label="Page title" value={value.about.title} onChange={(title) => updateAbout({ title })} />
      <div className="cms-field-full"><TextField label="Introduction" value={value.about.intro} onChange={(intro) => updateAbout({ intro })} multiline /></div>
      <div className="cms-field-full"><TextField label="Company story" value={value.about.body} onChange={(body) => updateAbout({ body })} multiline /></div>
      <div className="cms-field-full"><TextField label="Vision" value={value.about.vision} onChange={(vision) => updateAbout({ vision })} multiline /></div>
      <div className="cms-field-full"><TextField label="Mission" value={value.about.mission} onChange={(mission) => updateAbout({ mission })} multiline /></div>
    </div>
    <CollectionHeader title="Guiding principles" description="Add, remove or reorder the ideas that explain how Terratora works." onAdd={() => updateAbout({ principles: [...value.about.principles, { number: String(value.about.principles.length + 1).padStart(2, "0"), title: "New principle", text: "Explain this principle." }] })} />
    <div className="cms-card-list">{value.about.principles.map((principle, index) => <article className="cms-repeat-card" key={`${principle.number}-${index}`}><div className="cms-repeat-content"><div className="cms-repeat-heading"><strong>Principle {index + 1}</strong><RemoveButton onClick={() => updateAbout({ principles: value.about.principles.filter((_, itemIndex) => itemIndex !== index) })} /></div><div className="cms-form-grid compact"><TextField label="Number" value={principle.number} onChange={(number) => updateAbout({ principles: value.about.principles.map((item, itemIndex) => itemIndex === index ? { ...item, number } : item) })} /><TextField label="Title" value={principle.title} onChange={(title) => updateAbout({ principles: value.about.principles.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item) })} /></div><TextField label="Explanation" value={principle.text} onChange={(text) => updateAbout({ principles: value.about.principles.map((item, itemIndex) => itemIndex === index ? { ...item, text } : item) })} multiline /></div></article>)}</div>
  </>;
}

function ServicesEditor({ value, onChange }: EditorProps) {
  const updateServices = (changes: Partial<SiteContent["services"]>) => onChange({ ...value, services: { ...value.services, ...changes } });
  return <>
    <EditorHeading title="Services" description="Keep service descriptions clear and add deliverables as simple list items." />
    <div className="cms-panel cms-form-grid">
      <TextField label="Small page heading" value={value.services.eyebrow} onChange={(eyebrow) => updateServices({ eyebrow })} />
      <TextField label="Page title" value={value.services.title} onChange={(title) => updateServices({ title })} />
      <div className="cms-field-full"><TextField label="Introduction" value={value.services.intro} onChange={(intro) => updateServices({ intro })} multiline /></div>
    </div>
    <CollectionHeader title="Service list" description="Each service appears on the Services page and homepage service journey." onAdd={() => updateServices({ items: [...value.services.items, { number: String(value.services.items.length + 1).padStart(2, "0"), title: "New service", summary: "Describe the outcome of this service.", body: "Explain what this service covers and how Terratora helps.", deliverables: ["New deliverable"] }] })} />
    <div className="cms-card-list">{value.services.items.map((service, index) => <article className="cms-repeat-card" key={`${service.number}-${index}`}><div className="cms-repeat-content"><div className="cms-repeat-heading"><strong>Service {index + 1}</strong><RemoveButton onClick={() => updateServices({ items: value.services.items.filter((_, itemIndex) => itemIndex !== index) })} /></div><div className="cms-form-grid compact"><TextField label="Number" value={service.number} onChange={(number) => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, number } : item) })} /><TextField label="Service name" value={service.title} onChange={(title) => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, title } : item) })} /></div><TextField label="Short summary" hint="Used on the homepage service cards." value={service.summary} onChange={(summary) => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, summary } : item) })} multiline /><TextField label="Full service description" hint="Use a blank line to begin a new paragraph." value={service.body} onChange={(body) => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, body } : item) })} multiline /><div className="cms-subcollection"><div className="cms-subcollection-heading"><strong>What this can include</strong><button type="button" onClick={() => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, deliverables: [...item.deliverables, "New deliverable"] } : item) })}>+ Add item</button></div>{service.deliverables.map((deliverable, deliverableIndex) => <div className="cms-inline-row" key={`${deliverable}-${deliverableIndex}`}><input aria-label={`Deliverable ${deliverableIndex + 1}`} value={deliverable} onChange={(event) => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, deliverables: item.deliverables.map((entry, entryIndex) => entryIndex === deliverableIndex ? event.target.value : entry) } : item) })} /><RemoveButton onClick={() => updateServices({ items: value.services.items.map((item, itemIndex) => itemIndex === index ? { ...item, deliverables: item.deliverables.filter((_, entryIndex) => entryIndex !== deliverableIndex) } : item) })} /></div>)}</div></div></article>)}</div>

    <CollectionHeader title="Where should you start?" description="Match a visitor’s situation to the most relevant Terratora service." onAdd={() => updateServices({ startingPoints: [...value.services.startingPoints, { situation: "Describe the visitor’s situation", service: value.services.items[0]?.title ?? "Service" }] })} />
    <div className="cms-panel cms-starting-points">{value.services.startingPoints.map((point, index) => <div className="cms-starting-row" key={`${point.situation}-${index}`}><TextField label={`Situation ${index + 1}`} value={point.situation} onChange={(situation) => updateServices({ startingPoints: value.services.startingPoints.map((item, itemIndex) => itemIndex === index ? { ...item, situation } : item) })} /><label className="cms-field"><span>Recommended service</span><select value={point.service} onChange={(event) => updateServices({ startingPoints: value.services.startingPoints.map((item, itemIndex) => itemIndex === index ? { ...item, service: event.target.value } : item) })}>{value.services.items.map((service) => <option value={service.title} key={service.title}>{service.title}</option>)}</select></label><RemoveButton onClick={() => updateServices({ startingPoints: value.services.startingPoints.filter((_, itemIndex) => itemIndex !== index) })} /></div>)}</div>
  </>;
}

function ContactEditor({ value, onChange }: EditorProps) {
  const updateContact = (changes: Partial<SiteContent["contact"]>) => onChange({ ...value, contact: { ...value.contact, ...changes } });
  return <>
    <EditorHeading title="Contact page" description="Edit the invitation visitors see before they send a message." />
    <div className="cms-panel cms-form-grid">
      <TextField label="Small page heading" value={value.contact.eyebrow} onChange={(eyebrow) => updateContact({ eyebrow })} />
      <TextField label="Page title" value={value.contact.title} onChange={(title) => updateContact({ title })} />
      <div className="cms-field-full"><TextField label="Introduction" value={value.contact.intro} onChange={(intro) => updateContact({ intro })} multiline /></div>
    </div>
  </>;
}

function CollectionHeader({ title, description, onAdd }: { title: string; description: string; onAdd: () => void }) {
  return <div className="cms-collection-heading"><div><h3>{title}</h3><p>{description}</p></div><button type="button" onClick={onAdd}>+ Add item</button></div>;
}

function RemoveButton({ onClick }: { onClick: () => void }) {
  return <button type="button" className="cms-remove" onClick={onClick} aria-label="Remove item">Remove</button>;
}

type EditorProps = { value: SiteContent; onChange: (value: SiteContent) => void };
