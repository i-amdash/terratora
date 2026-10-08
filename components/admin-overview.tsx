import type { CSSProperties } from "react";
import type { Post, SiteAnalyticsSummary } from "@/lib/types";

export type AdminRecord = Record<string, string | number | boolean | null>;
type Destination = "journal" | "messages" | "bookings";

export function AdminOverview({ posts, messages, bookings, analytics, onNavigate }: { posts: Post[]; messages: AdminRecord[]; bookings: AdminRecord[]; analytics: SiteAnalyticsSummary; onNavigate: (destination: Destination) => void }) {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const totalReads = posts.reduce((total, post) => total + (post.read_count ?? 0), 0);
  const totalShares = posts.reduce((total, post) => total + (post.share_count ?? 0), 0);
  const totalLikes = posts.reduce((total, post) => total + (post.like_count ?? 0), 0);
  const bookingsThisMonth = bookings.filter((booking) => String(booking.created_at ?? booking.preferred_date ?? "").startsWith(thisMonth)).length;
  const newMessages = messages.filter((message) => !message.status || message.status === "new").length;
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    return { key, label: date.toLocaleDateString("en-GB", { month: "short" }), count: bookings.filter((booking) => String(booking.created_at ?? booking.preferred_date ?? "").startsWith(key)).length };
  });
  const largestMonth = Math.max(1, ...months.map((month) => month.count));
  const topPosts = [...posts].sort((a, b) => (b.read_count ?? 0) - (a.read_count ?? 0)).slice(0, 4);
  const recentActivity = [
    ...bookings.map((item) => ({ type: "Booking", title: fullName(item), detail: String(item.session_type ?? "Session request"), date: String(item.created_at ?? item.preferred_date ?? "") })),
    ...messages.map((item) => ({ type: "Message", title: fullName(item), detail: String(item.interest ?? item.organisation ?? "General enquiry"), date: String(item.created_at ?? "") })),
  ].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 5);

  const stats = [
    { label: "Site visits", value: analytics.total_visits, note: "Distinct browsing sessions" },
    { label: "Page views", value: analytics.total_page_views, note: `${analytics.views_this_month.toLocaleString()} viewed this month` },
    { label: "Unique visitors", value: analytics.unique_visitors, note: "Consented visitors" },
    { label: "Total bookings", value: bookings.length, note: `${bookingsThisMonth} received this month`, destination: "bookings" as const },
    { label: "Messages", value: messages.length, note: `${newMessages} awaiting review`, destination: "messages" as const },
    { label: "Publications", value: posts.length, note: "Published articles", destination: "journal" as const },
    { label: "Publication reads", value: totalReads, note: "Across all articles", destination: "journal" as const },
    { label: "Publication shares", value: totalShares, note: "Across all articles", destination: "journal" as const },
    { label: "Publication likes", value: totalLikes, note: "Across all articles", destination: "journal" as const },
  ];
  const trafficMonths = analytics.months.length ? analytics.months : months.map((month) => ({ month: month.key, page_views: 0, visits: 0 }));
  const largestTrafficMonth = Math.max(1, ...trafficMonths.map((month) => month.page_views));

  return <div className="admin-overview">
    <section className="overview-welcome"><div><p className="eyebrow">At a glance</p><h2>Here’s what is happening across Terratora.</h2></div><p>Monitor enquiries, booking frequency and publication engagement from one place.</p></section>
    <section className="overview-stats" aria-label="Website statistics">{stats.map((stat) => stat.destination ? <button type="button" onClick={() => onNavigate(stat.destination)} key={stat.label}><span>{stat.label}</span><strong>{stat.value.toLocaleString()}</strong><small>{stat.note} <b aria-hidden="true">→</b></small></button> : <article key={stat.label}><span>{stat.label}</span><strong>{stat.value.toLocaleString()}</strong><small>{stat.note}</small></article>)}</section>
    <div className="overview-grid">
      <section className="overview-panel booking-chart"><header><div><p className="eyebrow">Booking frequency</p><h3>Requests over six months</h3></div><button type="button" onClick={() => onNavigate("bookings")}>View bookings →</button></header><div className="bar-chart" aria-label="Bookings received in each of the last six months">{months.map((month) => <div className="bar-column" key={month.key}><div><span style={{ "--bar-height": `${Math.max(month.count ? 12 : 2, month.count / largestMonth * 100)}%` } as CSSProperties}><b>{month.count}</b></span></div><small>{month.label}</small></div>)}</div></section>
      <section className="overview-panel top-publications"><header><div><p className="eyebrow">Publications</p><h3>Most read</h3></div><button type="button" onClick={() => onNavigate("journal")}>Manage →</button></header>{topPosts.length ? <ol>{topPosts.map((post, index) => <li key={post.slug}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{post.title}</strong><small>{(post.read_count ?? 0).toLocaleString()} reads · {(post.share_count ?? 0).toLocaleString()} shares · {(post.like_count ?? 0).toLocaleString()} likes</small></div></li>)}</ol> : <p className="overview-empty">Published articles will appear here.</p>}</section>
    </div>
    <div className="overview-grid">
      <section className="overview-panel traffic-chart"><header><div><p className="eyebrow">Site traffic</p><h3>Page views over six months</h3></div><small>Analytics-consented visits only</small></header><div className="bar-chart" aria-label="Page views in each of the last six months">{trafficMonths.map((month) => <div className="bar-column" key={month.month}><div><span style={{ "--bar-height": `${Math.max(month.page_views ? 12 : 2, month.page_views / largestTrafficMonth * 100)}%` } as CSSProperties}><b>{month.page_views}</b></span></div><small>{formatMonth(month.month)}</small></div>)}</div></section>
      <section className="overview-panel top-pages"><header><div><p className="eyebrow">Page performance</p><h3>Most visited pages</h3></div></header>{analytics.top_pages.length ? <ol>{analytics.top_pages.map((page, index) => <li key={page.path}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{pageName(page.path)}</strong><small>{page.path} · {page.page_views.toLocaleString()} views · {page.visits.toLocaleString()} visits</small></div></li>)}</ol> : <p className="overview-empty">Page activity will appear after visitors accept analytics cookies.</p>}</section>
    </div>
    <section className="overview-panel recent-activity"><header><div><p className="eyebrow">Inbox activity</p><h3>Latest enquiries</h3></div></header>{recentActivity.length ? <div>{recentActivity.map((item, index) => <article key={`${item.type}-${item.date}-${index}`}><span className={`activity-type ${item.type.toLowerCase()}`}>{item.type}</span><div><strong>{item.title}</strong><small>{item.detail}</small></div><time>{formatDate(item.date)}</time></article>)}</div> : <p className="overview-empty">New booking requests and messages will appear here.</p>}</section>
  </div>;
}

function formatMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  if (!year || !month) return value;
  return new Date(year, month - 1, 1).toLocaleDateString("en-GB", { month: "short" });
}

function pageName(path: string) {
  if (path === "/") return "Homepage";
  return path.split("/").filter(Boolean).map((part) => part.replaceAll("-", " ")).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" / ");
}

function fullName(item: AdminRecord) {
  return [item.first_name, item.last_name].filter(Boolean).join(" ") || String(item.email ?? "Website visitor");
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}
