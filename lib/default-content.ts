import type { Post, SiteContent } from "./types";

export const defaultContent: SiteContent = {
  global: {
    email: "engage@terratoraconsulting.com",
    phone: "",
    location: "Nigeria · Africa · Global markets",
    announcement: "ESG and Sustainability Advisory",
  },
  home: {
    eyebrow: "ESG · Sustainability · Reporting",
    title: "Navigate ESG change.",
    titleAccent: "Build lasting value.",
    intro: "Terratora helps organisations translate sustainability requirements into practical action, reliable information and stronger business capability.",
    manifesto: "We identify the gap and help close it—building the governance, data and reporting capability organisations need to move from evolving requirements to confident action.",
    clients: ["FINANCIAL SERVICES", "ENERGY & RESOURCES", "MANUFACTURING", "CONSUMER & RETAIL", "INFRASTRUCTURE", "PROFESSIONAL SERVICES", "PUBLIC & PRIVATE COMPANIES"],
    metrics: [
      { value: "07", label: "Integrated ESG solutions" },
      { value: "S1/S2", label: "IFRS sustainability standards" },
      { value: "360°", label: "Governance, data and reporting" },
    ],
    heroSlides: [
      { image: "/images/hero/global-markets.jpg", position: "38% 64%", label: "Nigeria · Africa · Global markets", caption: "Navigate ESG change with a clearer view of what comes next." },
      { image: "/images/hero/sustainable-business.jpg", position: "50% 52%", label: "ESG readiness", caption: "Turn evolving requirements into practical business action." },
      { image: "/images/hero/reporting.jpg", position: "50% 48%", label: "Credible reporting", caption: "Build reliable information, reporting processes and stronger capability." },
      { image: "/images/hero/operations.jpg", position: "54% 52%", label: "Operational resilience", caption: "Connect sustainability expectations to the realities of your operations." },
      { image: "/images/hero/supply-chain.jpg", position: "45% 48%", label: "Supply-chain visibility", caption: "See beyond suppliers and understand risk across your value chain." },
      { image: "/images/hero/governance.jpg", position: "50% 52%", label: "Governance and controls", caption: "Create the oversight and accountability behind confident decisions." },
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

export const defaultPosts: Post[] = [
  { slug: "strategy-needs-friction", title: "Good strategy needs friction", excerpt: "Consensus feels productive. Constructive tension is what gets you somewhere new.", body: "The strongest strategies rarely begin with agreement. They begin when a team is willing to name the choices it has avoided.\n\nConstructive friction is not conflict for its own sake. It is the discipline of holding two plausible futures in view long enough to understand what each demands—and what each makes impossible.\n\nCreate room for dissent early. Separate ideas from hierarchy. Ask what would have to be true. Then turn the tension into a decision people can act on.", category: "Perspective", published_at: "2026-08-18", featured: true },
  { slug: "change-is-a-design-problem", title: "Change is a design problem", excerpt: "Transformation fails when it is announced as a destination instead of designed as a daily experience.", body: "Most transformation plans are articulate about the destination and vague about Tuesday morning. That gap is where momentum disappears.\n\nTreat change as an experience. What will people see, hear, decide, and do differently? Which systems reinforce the old behaviour? What is the smallest visible proof that a new way is working?\n\nChange becomes believable when it becomes tangible.", category: "Field note", published_at: "2026-07-04" },
  { slug: "the-value-of-not-knowing", title: "The value of not knowing", excerpt: "In uncertain markets, the quality of your learning loop matters more than the certainty of your plan.", body: "A confident plan can be comforting, especially when the conditions around it are moving. But certainty is often the wrong ambition.\n\nBuild a point of view, make its assumptions visible, and design a fast way to test them. The organisation that learns with discipline will outpace the one that predicts with confidence.", category: "Briefing", published_at: "2026-05-22" },
];
