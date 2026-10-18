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
  published?: boolean;
  created_at?: string;
  read_count?: number;
  share_count?: number;
  like_count?: number;
  comments_require_approval?: boolean;
  updated_at?: string;
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

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: import("./admin-permissions").AdminRole;
  permissions: import("./admin-permissions").AdminPermission[];
  is_active: boolean;
  created_at?: string;
  last_sign_in_at?: string;
};

export type SiteAnalyticsSummary = {
  total_visits: number;
  total_page_views: number;
  unique_visitors: number;
  views_this_month: number;
  months: { month: string; page_views: number; visits: number }[];
  top_pages: { path: string; page_views: number; visits: number }[];
  top_locations: { country_code: string; city: string; page_views: number; visits: number }[];
};

export type PublicationComment = {
  id: string;
  parent_id?: string | null;
  author_name: string;
  body: string;
  like_count: number;
  liked?: boolean;
  status?: "pending" | "published" | "hidden";
  is_team?: boolean;
  created_at: string;
};

export type AdminPublicationComment = PublicationComment & {
  post_id: string;
  author_email: string;
  post_title: string;
  post_slug: string;
  status: "pending" | "published" | "hidden";
  is_team: boolean;
};

export type AdminMessage = {
  [key: string]: string | number | boolean | null | undefined;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation?: string | null;
  interest?: string | null;
  message: string;
  status: "new" | "in_progress" | "completed";
  created_at: string;
};

export type AdminBooking = {
  [key: string]: string | number | boolean | null | undefined;
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organisation?: string | null;
  preferred_date: string;
  preferred_time: string;
  timezone: string;
  session_type: string;
  message: string;
  status: "pending" | "scheduled" | "completed" | "cancelled";
  scheduled_at?: string | null;
  created_at: string;
};

export type Subscriber = {
  id: string;
  name: string;
  email: string;
  consent_at: string;
  consent_source: string;
  subscribed_at: string;
  updated_at: string;
};

export type Newsletter = {
  id: string;
  subject: string;
  body: string;
  status: "draft" | "sending" | "scheduled" | "sent" | "failed" | "canceled";
  recipient_count: number;
  last_error?: string | null;
  created_at: string;
  sent_at?: string | null;
  scheduled_for?: string | null;
  resend_broadcast_id?: string | null;
  updated_at?: string;
};
