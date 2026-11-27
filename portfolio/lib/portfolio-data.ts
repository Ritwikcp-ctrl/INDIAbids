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
  role: "Full-Stack Engineer & Product Builder",
  location: "India",
  joined: "Building since 2024",
  websiteLabel: "indiabids.in",
  websiteHref: INDIABIDS_URL,
  email: "hello@indiabids.in",
  availability: "Open to full-stack & AI-native engineering roles",
  headline: "Building deterministic systems, sharp interfaces & shipped products.",
  bio: "Actions speak louder than words — I architect full-stack TypeScript applications from ACID database transactions and payment pipelines to interactive motion-driven UIs.",
  bannerImage: "", // Optional: set "/banner.jpg" or paste directly in the UI
  avatarImage: "", // Optional: set "/avatar.jpg" or paste directly in the UI
  socials: {
    github: "https://github.com",
    twitter: "https://x.com",
    linkedin: "https://linkedin.com",
    email: "mailto:hello@indiabids.in",
  },
};

export const EXPERIENCE_ITEMS: ExperienceItem[] = [
  {
    id: "indiabids",
    role: "Creator & Lead Full-Stack Engineer",
    company: "INDIAbids",
    period: "2026 — Present",
    location: "Remote · India",
    type: "Flagship Product",
    summary:
      "Designed and engineered an end-to-end transparent paid leaderboard platform spanning 23 industry sectors and 36 Indian states & UTs.",
    highlights: [
      "Architected PostgreSQL ACID payment reconciliation with row-level locks (FOR UPDATE) and pg_advisory_xact_lock serialization synced to Redis Sorted Sets for O(log N) rank reads.",
      "Built dual-path Razorpay payment settlement (instant checkout signature verification + idempotent webhook handler) supporting anonymous manage keys and authenticated claiming.",
      "Implemented JWT + rotating HttpOnly refresh token sessions, Google OAuth 2.0, multi-origin CSRF/CORS enforcement, and Next.js 16 App Router frontend with dark/light theming.",
    ],
    stack: [
      "Next.js 16",
      "TypeScript",
      "Express 5",
      "PostgreSQL",
      "Prisma 7",
      "Redis",
      "Razorpay",
      "Tailwind v4",
    ],
    link: INDIABIDS_URL,
  },
  {
    id: "ui-systems",
    role: "Creative Frontend & UI Systems Engineer",
    company: "Independent / Open Source",
    period: "2025 — 2026",
    location: "India",
    type: "UI Engineering",
    summary:
      "Crafted interactive, motion-engineered React component systems and marketing experiences with strict accessibility and zero layout-thrash animations.",
    highlights: [
      "Built composable branched SVG navigation menus, 3D character flip headings, interactive cursor-tracking CTA buttons, and dual-direction marquee sections.",
      "Standardized CSS variable design tokens across dark Carbon and light Bone themes with Framer Motion spring physics and reduced-motion fallbacks.",
    ],
    stack: ["React 19", "Framer Motion", "Tailwind CSS", "Radix UI", "Hugeicons"],
  },
  {
    id: "editable-role",
    role: "Software Engineering Intern / Freelance (Editable Slot)",
    company: "Add Your Previous Role or Organization",
    period: "2024 — 2025",
    location: "India",
    type: "Experience Slot",
    summary:
      "Template slot ready for your prior internship, freelance client engagement, or campus engineering leadership experience.",
    highlights: [
      "Replace this bullet in lib/portfolio-data.ts with measurable latency, conversion, or reliability improvements you shipped.",
      "Add links to shipped repositories, live demos, or case studies.",
    ],
    stack: ["Node.js", "PostgreSQL", "Docker", "GitHub Actions"],
  },
];

export const PROJECT_ITEMS: ProjectItem[] = [
  {
    id: "indiabids",
    title: "INDIAbids",
    tagline: "Deterministic Paid Leaderboard for Indian Businesses",
    featured: true,
    status: "Production Ready",
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
    repoHref: "https://github.com",
  },
  {
    id: "branched-nav",
    title: "Interactive Motion UI Kit",
    tagline: "Composable React Bits & Physics-Driven Controls",
    status: "Open Source",
    year: "2026",
    description:
      "A collection of tactile React UI primitives featuring SVG branch path animations, cursor-tracking eyes, 3D flip typography, and accessible keyboard navigation.",
    architecture: [
      "GPU-composited transforms (rotateX, rotateY, translate, strokeDashoffset) with zero layout-property animation.",
      "Full dark/light token compatibility and prefers-reduced-motion compliance.",
    ],
    stack: ["React 19", "Framer Motion", "Tailwind v4", "TypeScript"],
    liveHref: INDIABIDS_URL,
  },
  {
    id: "slot-project",
    title: "Project Slot #3 (Editable)",
    tagline: "Add your next AI, SaaS, or systems build here",
    status: "Template",
    year: "2026",
    description:
      "Use this card in lib/portfolio-data.ts to showcase another flagship project, CLI tool, or AI agent workflow with live preview links.",
    architecture: [
      "Swap title, description, stack tags, and GitHub/live URLs in a single TypeScript data file.",
    ],
    stack: ["Python", "Next.js", "AI Agents", "Cloudflare"],
  },
];

export const HIGHLIGHTS: HighlightItem[] = [
  {
    badge: "Architecture",
    title: "ACID + O(log N) Ranking Engine",
    detail:
      "Combined Postgres advisory locks with Redis sorted sets for concurrent, double-spend-proof bid updates.",
  },
  {
    badge: "Payments",
    title: "Dual-Verified Razorpay Pipeline",
    detail:
      "Client checkout signature verification paired with atomic idempotent webhooks and amount/currency assertions.",
  },
  {
    badge: "Security",
    title: "Zero-PII Leak Audit & Auth",
    detail:
      "Implemented JWT + HttpOnly refresh rotation, Google OAuth 2.0, URL XSS guards, and strict ownership checks.",
  },
  {
    badge: "Milestone Slot",
    title: "Hackathon / OSS / Program Badge",
    detail:
      "Replace with your hackathon wins, GSoC / open-source selections, or certifications in lib/portfolio-data.ts.",
  },
];

export const SKILL_GROUPS = [
  {
    group: "Frontend & Motion",
    items: ["Next.js (App Router)", "React 19", "TypeScript", "Tailwind CSS v4", "Framer Motion", "Radix / shadcn"],
  },
  {
    group: "Backend & Auth",
    items: ["Node.js", "Express 5", "Zod", "JWT & HttpOnly Cookies", "Google OAuth 2.0", "Pino Logging"],
  },
  {
    group: "Data & Payments",
    items: ["PostgreSQL", "Prisma 7 ORM", "Redis Sorted Sets", "ACID Transactions", "Razorpay Orders", "Webhooks"],
  },
  {
    group: "Infra & Hosting",
    items: ["Docker & Compose", "GitHub Actions CI/CD", "Vercel", "Cloudflare Pages", "Zoho Catalyst", "Linux"],
  },
];

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
