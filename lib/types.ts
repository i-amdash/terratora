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
    organisations: { name: string; image: string }[];
    heroSlides: {
      image: string;
      position: string;
      eyebrow: string;
      title: string;
      titleAccent: string;
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
  author_id?: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  category: string;
  published_at: string;
  image_url?: string;
  author_name?: string;
  author_avatar_url?: string;
  featured?: boolean;
  read_count?: number;
  share_count?: number;
  like_count?: number;
};

export type Author = {
  id: string;
  name: string;
  role?: string;
  bio?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
};

export type PublicationComment = {
  id: string;
  parent_id?: string | null;
  author_name: string;
  body: string;
  like_count: number;
  liked?: boolean;
  created_at: string;
};
