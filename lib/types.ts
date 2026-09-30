export type SiteContent = {
  global: {
    email: string;
    phone: string;
    location: string;
    announcement: string;
  };
  home: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    intro: string;
    manifesto: string;
    clientIntro: string;
    ctaTitle: string;
    ctaText: string;
    clients: string[];
    metrics: { value: string; label: string }[];
    heroSlides: {
      image: string;
      position: string;
      label: string;
      caption: string;
    }[];
  };
  about: {
    eyebrow: string;
    title: string;
    intro: string;
    body: string;
    vision: string;
    mission: string;
    principles: { number: string; title: string; text: string }[];
  };
  services: {
    eyebrow: string;
    title: string;
    intro: string;
    items: { number: string; title: string; summary: string; body: string; deliverables: string[] }[];
    startingPoints: { situation: string; service: string }[];
  };
  contact: {
    eyebrow: string;
    title: string;
    intro: string;
  };
};

export type Post = {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  published_at: string;
  featured?: boolean;
};
