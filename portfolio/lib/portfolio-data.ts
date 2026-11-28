export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  type: string;
  summary: string;
  highlights: string[];
  stack: string[];
  link?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  featured?: boolean;
  status: string;
  year: string;
  image?: string;
  description: string;
  architecture: string[];
  stack: string[];
  liveHref?: string;
  repoHref?: string;
}

export interface HighlightItem {
  badge: string;
  title: string;
  detail: string;
}

export type SkillIconId =
  | "javascript"
  | "typescript"
  | "systems"
  | "nodejs"
  | "express"
  | "motion"
  | "postgresql"
  | "prisma"
  | "mongodb"
  | "redis"
  | "blockchain"
  | "solidity"
  | "docker"
  | "github"
  | "linux";

export interface SkillItem {
  id: SkillIconId;
  name: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  tags: string[];
  date: string;
  readTime: string;
  summary: string;
  body: string[];
}

const INDIABIDS_URL =
  process.env.NEXT_PUBLIC_INDIABIDS_URL || "https://indiabids.in";

export const PORTFOLIO_PROFILE = {
  name: "Tejas",
  username: "@tejas_dev",
  handle: "Tejas | Developer",
  role: "Engineer / Gamer",
  location: "India",
  joined: "Building since 2024",
  websiteLabel: "indiabids.in",
  websiteHref: INDIABIDS_URL,
  email: "hello@indiabids.in",
  availability: "Open to full-stack & AI-native engineering roles",
  headline: "Building Startup · CrossPnP agriculture startup.",
  bio: "Building Startup.",
  bioPoints: [
    "Building CrossPnP — an agriculture startup.",
    "AI, open source, and research papers excite me.",
    "I always believe in KARMA.",
  ],
  bannerImage: "", // Optional: set "/banner.jpg" or paste directly in the UI
  avatarImage: "", // Optional: set "/avatar.jpg" or paste directly in the UI
  githubUsername: "Ritwikcp-ctrl",
  quote: "Karma decides the long game — build honestly, ship cleanly, keep learning.",
  quoteAuthor: "Tejas",
  socials: {
    github: "https://github.com/Ritwikcp-ctrl",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@indiabids.in",
  },
};

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "crosspnp",
    role: "Building Startup — CrossPnP",
    company: "CrossPnP (Agriculture Startup)",
    period: "Present",
    location: "India",
    type: "Founder & Builder",
    summary:
      "Building CrossPnP, an agriculture-focused technology startup solving real-world coordination, commerce, and infrastructure problems for farming ecosystems.",
    highlights: [
      "Architecting the core platform, workflows, and product roadmap from zero to one.",
      "Applying AI, full-stack engineering, and open-source tools directly in the field.",
    ],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AI"],
  },
  {
    id: "fresher",
    role: "Fresher",
    company: "Open to Engineering & Startup Collaborations",
    period: "2026",
    location: "India",
    type: "Early Career",
    summary:
      "Hands-on systems and full-stack builder with deep curiosity across AI, research papers, open source, and production software craftsmanship.",
    highlights: [
      "Built and deployed production full-stack systems including INDIAbids end-to-end.",
      "Actively experimenting with low-level systems programming on Linux, Web3, and applied AI.",
    ],
    stack: ["TypeScript", "Express", "PostgreSQL", "Redis", "Docker", "Linux"],
  },
];

/**
 * Add permanent flagship / live projects directly to PROJECT_ITEMS with `featured: true`
 * and a `liveHref` URL, or add them dynamically from the Portfolio UI (+ Add Live Project).
 */
export const PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "indiabids",
    title: "INDIAbids",
    tagline: "Deterministic Paid Leaderboard for Indian Businesses",
    featured: true,
    status: "Live",
    year: "2026",
    description:
      "A two-tier (National & 36 State/UT) paid ranking platform where lifetime cumulative INR spend determines leaderboard rank—with zero subscriptions and instant Razorpay settlement.",
    architecture: [
      "Source of money in PostgreSQL (Payment → Bid → BoardMembership) with composite Redis ZSET scores for tie-breaking by earliest timestamp.",
      "One-time SHA-256 hashed manage tokens allowing frictionless anonymous bidding and seamless account claiming later.",
      "Hardened Express API with Zod validation, multi-origin CORS/origin guards, rate limiters, and containerized Docker + CI/CD deployment.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Redis",
      "Razorpay",
      "Docker",
    ],
    liveHref: INDIABIDS_URL,
    repoHref: "https://github.com/Ritwikcp-ctrl/INDIAbids",
  },
  {
    id: "crosspnp",
    title: "CrossPnP",
    tagline: "Agriculture Startup & Supply Coordination Platform",
    featured: true,
    status: "Building",
    year: "2026",
    description:
      "Building CrossPnP — technology infrastructure and coordination workflows for farming ecosystems and agricultural commerce.",
    architecture: [],
    stack: ["Next.js", "TypeScript", "Node.js", "PostgreSQL", "AI"],
  },
  {
    id: "sanskrit",
    title: "Sanskrit",
    tagline: "A New Programming Language",
    featured: true,
    status: "Not Started",
    year: "2026",
    description:
      "Designing a deterministic programming language inspired by formal Sanskrit grammar and structured expression rules.",
    architecture: [],
    stack: ["Compilers", "Systems", "PL Design"],
  },
];

export const HIGHLIGHTS: HighlightItem[] = [];

export const SKILLS: SkillItem[] = [
  { id: "typescript", name: "TypeScript" },
  { id: "docker", name: "Docker" },
  { id: "postgresql", name: "PostgreSQL" },
  { id: "express", name: "Express" },
  { id: "solidity", name: "Solidity" },
  { id: "redis", name: "Redis" },
  { id: "motion", name: "Motion" },
  { id: "systems", name: "System Programming" },
  { id: "prisma", name: "Prisma" },
  { id: "javascript", name: "JavaScript" },
  { id: "blockchain", name: "Blockchain" },
  { id: "mongodb", name: "MongoDB" },
  { id: "nodejs", name: "Node.js" },
  { id: "github", name: "GitHub" },
];

export const LINUX_FOUNDATION = {
  name: "Linux OS",
  capabilities: ["Kernel & Processes", "Shell & Networking", "Containers", "Self-Hosted Prod"],
};

/**
 * Add future blog posts directly to this array.
 * Each entry automatically appears in the Blogs section and /blogs.
 */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "deterministic-paid-leaderboards",
    title: "Designing Deterministic Paid Leaderboards with Postgres & Redis",
    category: "Architecture",
    tags: ["PostgreSQL", "Redis", "ACID"],
    date: "Nov 2026",
    readTime: "4 min read",
    summary:
      "How to combine PostgreSQL advisory locks as the source of money with Redis ZSET composite scores for O(log N) tie-broken rankings.",
    body: [
      "When real money determines leaderboard rank, eventual consistency bugs or race conditions immediately erode user trust. Redis is ideal for O(log N) sorted reads, but money should never live exclusively in memory.",
      "In INDIAbids, every verified payment runs inside a PostgreSQL transaction using SELECT ... FOR UPDATE on the payment row and pg_advisory_xact_lock on the board membership. Only after Postgres commits does the API write the composite score (totalSpendPaise * 1_000_000 + timeOffset) to Redis.",
      "If Redis ever restarts or misses a key, the read path automatically reconciles the sorted set directly from PostgreSQL—giving both speed and financial integrity.",
    ],
  },
  {
    slug: "idempotent-razorpay-webhooks",
    title: "Idempotent Razorpay Webhooks & Checkout Signature Verification",
    category: "Payments",
    tags: ["Razorpay", "Webhooks", "Security"],
    date: "Nov 2026",
    readTime: "3 min read",
    summary:
      "Why webhook events and payment reconciliation must share the same database transaction—plus guarding against amount tampering.",
    body: [
      "Recording a webhook event ID before reconciling the payment creates a subtle failure mode: if reconciliation throws transiently, retries see the duplicate event ID and skip fulfillment.",
      "Moving paymentWebhookEvent insertion inside the same ACID transaction as Payment, Bid, and BoardMembership updates ensures all-or-nothing durability, while strict amountPaise and currency assertions block tampered payloads.",
      "Pairing server-verified checkout callbacks (/payments/verify) with Razorpay webhooks gives users instant confirmation without sacrificing webhook reliability.",
    ],
  },
  {
    slug: "future-blog-template",
    title: "Next Engineering Essay (Draft Slot — Ready for Future Posts)",
    category: "Notes",
    tags: ["Next.js", "TypeScript"],
    date: "Coming Soon",
    readTime: "Draft",
    summary:
      "Duplicate this object inside BLOG_POSTS in lib/portfolio-data.ts to publish a new blog post anytime.",
    body: [
      "This template slot demonstrates how multi-paragraph engineering articles render inside the Blogs reader and /blogs directory.",
    ],
  },
];

export const CONTRIBUTION_WEEKS: number[][] = Array.from({ length: 20 }, (_, w) =>
  Array.from({ length: 7 }, (_, d) => {
    const v = (w * 7 + d * 3 + (w % 4)) % 11;
    if (v === 0 || v === 1) return 0;
    if (v <= 3) return 1;
    if (v <= 6) return 2;
    if (v <= 8) return 3;
    return 4;
  })
);
