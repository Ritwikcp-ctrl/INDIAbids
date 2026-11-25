"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/auth-provider";
import { REAL_CATEGORIES } from "@/types/categories";
import { ALL_INDIAN_STATES } from "@/types/states";
import { formatInr } from "@/components/ui/lib/money";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ArrowRight,
  Search,
  Globe,
  MapPin,
  ShieldCheck,
  Zap,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
  Building2,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  // Hero Quick Jump state
  const [heroCategory, setHeroCategory] = useState(REAL_CATEGORIES[0].slug);
  const [heroScope, setHeroScope] = useState<"national" | "state">("national");
  const [heroState, setHeroState] = useState<string>("Delhi");

  // Estimator state
  const [calcUrl, setCalcUrl] = useState("");
  const [calcCategory, setCalcCategory] = useState(REAL_CATEGORIES[0].slug);
  const [calcScope, setCalcScope] = useState<"national" | "state">("national");
  const [calcState, setCalcState] = useState("Delhi");
  const [calcResult, setCalcResult] = useState<null | {
    minBid: number;
    categoryName: string;
    targetBoard: string;
  }>(null);

  // FAQ toggle state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleHeroNavigate(e: React.FormEvent) {
    e.preventDefault();
    if (heroScope === "national") {
      router.push(`/bid?scope=national&categorySlug=${heroCategory}`);
    } else {
      router.push(`/bid?scope=state&state=${encodeURIComponent(heroState)}&categorySlug=${heroCategory}`);
    }
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!calcUrl.trim()) return;

    const cat = REAL_CATEGORIES.find((c) => c.slug === calcCategory) || REAL_CATEGORIES[0];
    setCalcResult({
      minBid: calcScope === "national" ? 500 : 100,
      categoryName: cat.name,
      targetBoard: calcScope === "national" ? "National Board" : `State Board (${calcState})`,
    });
  }

  const faqs = [
    {
      q: "How does the ranking system work?",
      a: "Rank is determined strictly by lifetime cumulative spend. The business with the highest total verified bid holds Rank #1. When two bids are equal, the earlier transaction holds priority. Money is never overwritten; you can raise your rank anytime by simply paying the difference.",
    },
    {
      q: "Can I bid without creating an account?",
      a: "Yes. Authentication is completely optional. Anonymous users receive a one-time cryptographic manage link to update or raise their listing later. If you register an account in the future, you can claim any anonymous listing to your dashboard with one click.",
    },
    {
      q: "What is the difference between National and State boards?",
      a: "Each category features two independent boards: the National Board (₹500 minimum bid) for pan-India reach, and individual State Boards (₹100 minimum bid) for hyper-local authority in all 36 Indian states and union territories. A business can list on both boards with separate spend totals.",
    },
    {
      q: "Do bids expire or require monthly subscriptions?",
      a: "No. There are zero subscriptions, monthly fees, or expirations. Your spend accumulates permanently. Once you reach Rank #1, you keep it until a competitor places a higher cumulative bid.",
    },
    {
      q: "How are payments processed?",
      a: "Payments are processed securely via Razorpay (UPI, Credit/Debit cards, NetBanking). The rank updates instantly on the live leaderboard as soon as the transaction is confirmed.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* ─────────────────────────────────────────────────────────────
          1. NAVIGATION BAR
          ───────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-tight shadow-sm">
                IB
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                INDIA<span className="text-primary font-black">bids</span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-5 text-sm text-muted-foreground">
              <a href="#categories" className="hover:text-foreground transition-colors">
                Categories
              </a>
              <Link href="/bid?scope=national" className="hover:text-foreground transition-colors">
                National Board
              </Link>
              <Link href="/bid?scope=state&state=Delhi" className="hover:text-foreground transition-colors">
                State Boards
              </Link>
              <a href="#how-it-works" className="hover:text-foreground transition-colors">
                How It Works
              </a>
              <a href="#faq" className="hover:text-foreground transition-colors">
                FAQ
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-2.5">
            {user ? (
              <Button asChild variant="outline" size="sm" className="text-xs font-medium">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            <Button asChild size="sm" className="text-xs font-semibold shadow-sm">
              <Link href="/bid?scope=national">
                List Business <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>

            {/* Theme Toggle Button on Right Corner */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. HERO SECTION
          ───────────────────────────────────────────────────────────── */}
      <section className="relative border-b border-border/60 bg-gradient-to-b from-background via-card/40 to-background py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Verified Paid Leaderboard · 23 Categories · 36 States & UTs</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            The Transparent Paid Leaderboard for Indian Businesses.
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            Businesses and creators bid for rank within their industry across independent National and State boards. No subscriptions. Permanent cumulative spend. Instant fulfillment.
          </p>

          {/* Quick Board Selector Form in Hero */}
          <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-border/90 bg-card p-3 sm:p-4 shadow-xl">
            <form onSubmit={handleHeroNavigate} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
              {/* Category Select */}
              <div className="text-left sm:col-span-2">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Category
                </label>
                <Select value={heroCategory} onValueChange={setHeroCategory}>
                  <SelectTrigger className="h-10 text-xs w-full bg-background">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {REAL_CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scope & State Select */}
              <div className="text-left">
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Scope
                </label>
                <Select
                  value={heroScope}
                  onValueChange={(v) => setHeroScope(v as "national" | "state")}
                >
                  <SelectTrigger className="h-10 text-xs w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national" className="text-xs">
                      National (All-India)
                    </SelectItem>
                    <SelectItem value="state" className="text-xs">
                      State Board
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* State Dropdown (Conditional) or Direct Action */}
              <div className="text-left flex flex-col justify-end">
                {heroScope === "state" ? (
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                      State / UT
                    </label>
                    <Select value={heroState} onValueChange={setHeroState}>
                      <SelectTrigger className="h-10 text-xs w-full bg-background">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {ALL_INDIAN_STATES.map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <Button type="submit" className="h-10 w-full text-xs font-semibold shadow-sm">
                    View Board <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </form>

            {heroScope === "state" && (
              <div className="mt-3 pt-3 border-t border-border/60 flex justify-end">
                <Button onClick={handleHeroNavigate} className="h-9 px-6 text-xs font-semibold shadow-sm">
                  View {heroState} Board <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Key Trust Metrics */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center border-t border-border/40 max-w-3xl mx-auto">
            <div>
              <p className="text-2xl font-bold text-foreground">23</p>
              <p className="text-xs text-muted-foreground mt-0.5">Industry Sectors</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">36</p>
              <p className="text-xs text-muted-foreground mt-0.5">States & UTs Covered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">₹500 / ₹100</p>
              <p className="text-xs text-muted-foreground mt-0.5">National / State Min Bid</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">0%</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recurring Subscriptions</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. CATEGORIES MATRIX
          ───────────────────────────────────────────────────────────── */}
      <section id="categories" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
              Browse Categories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Select Your Industry Leaderboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose from 23 real-time categories. Place a bid to claim Rank #1.
            </p>
          </div>

          <Button asChild variant="outline" size="sm" className="text-xs">
            <Link href="/bid?scope=national">View All National Boards →</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REAL_CATEGORIES.map((cat, idx) => (
            <div
              key={cat.slug}
              className="card-surface rounded-xl p-5 flex flex-col justify-between hover:border-primary/40 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-primary">
                    Sector #{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    National & 36 States
                  </Badge>
                </div>

                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Starts at <strong className="text-foreground">₹100</strong>
                </span>
                <Button asChild size="sm" variant="ghost" className="h-7 text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Link href={`/bid?scope=national&categorySlug=${cat.slug}`}>
                    View Board →
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. HOW IT WORKS
          ───────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 bg-card/40 border-y border-border/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
              Three-Step Architecture
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How INDIAbids Operates
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              A transparent, deterministic protocol where verified spend defines rank without hidden algorithms.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-surface rounded-xl p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                01
              </div>
              <h3 className="text-base font-bold text-foreground">Select Scope & Board</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Choose between the All-India National Board (₹500 min bid) or your state board (₹100 min bid). Each board maintains its own spend ladder.
              </p>
            </div>

            <div className="card-surface rounded-xl p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                02
              </div>
              <h3 className="text-base font-bold text-foreground">Place Your Bid Instantly</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pay securely via UPI or cards. Auth is optional: anonymous bidders receive a cryptographic token to manage or raise bids later.
              </p>
            </div>

            <div className="card-surface rounded-xl p-6 space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                03
              </div>
              <h3 className="text-base font-bold text-foreground">Compound & Defend Rank</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every rupee you spend accumulates permanently. If a competitor bids higher, you can reclaim Rank #1 by simply paying the difference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. TWO INDEPENDENT BOARDS BREAKDOWN
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
            Dual Board Architecture
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            National vs State Strategy
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Businesses can compete on both boards simultaneously with separate spend totals.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="card-surface rounded-xl p-6 border-l-4 border-l-primary flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Globe className="h-4 w-4" /> NATIONAL LEADERBOARD
                </span>
                <span className="text-xs font-semibold text-foreground">₹500 Min</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Pan-India Reach</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built for digital products, D2C brands, nationwide agencies, and startups seeking national attention. Compete across all 1.4 billion people with a single cumulative ranking.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <Button asChild size="sm" className="w-full text-xs font-semibold">
                <Link href="/bid?scope=national">Enter National Board →</Link>
              </Button>
            </div>
          </div>

          <div className="card-surface rounded-xl p-6 border-l-4 border-l-emerald-500 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                  <MapPin className="h-4 w-4" /> STATE LEADERBOARDS
                </span>
                <span className="text-xs font-semibold text-foreground">₹100 Min</span>
              </div>
              <h3 className="text-xl font-bold text-foreground">Hyperlocal Dominance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ideal for local businesses, restaurants, dhabas, regional services, and creators targeting audiences within Delhi, Maharashtra, Karnataka, or any of India&apos;s 36 states and UTs.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-border/50">
              <Button asChild size="sm" variant="outline" className="w-full text-xs font-semibold">
                <Link href="/bid?scope=state&state=Delhi">Enter State Boards →</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. RANK ESTIMATOR TOOL
          ───────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6 bg-card/40 border-t border-border/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
              Rank Calculator
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Calculate Your Entry Requirement
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select your target category and scope to see what it takes to secure Rank #1.
            </p>
          </div>

          <form onSubmit={handleCalculate} className="card-surface rounded-xl p-6 space-y-4 shadow-lg">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Category
                </label>
                <Select value={calcCategory} onValueChange={setCalcCategory}>
                  <SelectTrigger className="h-9 text-xs w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {REAL_CATEGORIES.map((c) => (
                      <SelectItem key={c.slug} value={c.slug} className="text-xs">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  Board Scope
                </label>
                <Select
                  value={calcScope}
                  onValueChange={(v) => setCalcScope(v as "national" | "state")}
                >
                  <SelectTrigger className="h-9 text-xs w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="national" className="text-xs">
                      National Board
                    </SelectItem>
                    <SelectItem value="state" className="text-xs">
                      State Board
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-1">
                  State (If State Board)
                </label>
                <Select
                  value={calcState}
                  onValueChange={setCalcState}
                  disabled={calcScope !== "state"}
                >
                  <SelectTrigger className="h-9 text-xs w-full bg-background disabled:opacity-50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {ALL_INDIAN_STATES.map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Your Website or Handle
              </label>
              <div className="flex gap-2">
                <Input
                  value={calcUrl}
                  onChange={(e) => setCalcUrl(e.target.value)}
                  placeholder="https://yourbrand.in"
                  className="h-9 text-xs bg-background"
                  required
                />
                <Button type="submit" size="sm" className="h-9 px-5 text-xs font-semibold shrink-0">
                  Calculate
                </Button>
              </div>
            </div>

            {calcResult && (
              <div className="mt-4 pt-4 border-t border-border/60 rounded-lg bg-background/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
                      Rank #1 Available
                    </Badge>
                    <span className="text-xs font-bold text-foreground">{calcUrl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {calcResult.categoryName} · {calcResult.targetBoard}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Minimum Bid</span>
                    <span className="text-base font-bold text-foreground">
                      {formatInr(calcResult.minBid)}
                    </span>
                  </div>
                  <Button asChild size="sm" className="text-xs font-semibold shadow-sm">
                    <Link
                      href={`/bid?scope=${calcScope}&categorySlug=${calcCategory}&state=${encodeURIComponent(
                        calcState
                      )}&url=${encodeURIComponent(calcUrl)}`}
                    >
                      Claim Rank #1 →
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. FAQ ACCORDION SECTION
          ───────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-20 px-4 sm:px-6 max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <Badge variant="outline" className="text-xs font-semibold uppercase tracking-wider mb-2">
            Frequently Asked Questions
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Clear Answers on Ranking & Money
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="card-surface rounded-xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-sm font-semibold text-foreground"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          8. FOOTER
          ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-card/60 py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">INDIAbids</span>
            <span>—</span>
            <span>Rank is what you pay. Relevance is where you compete.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/bid?scope=national" className="hover:text-foreground transition-colors">
              National Board
            </Link>
            <Link href="/bid?scope=state&state=Delhi" className="hover:text-foreground transition-colors">
              State Boards
            </Link>
            <Link href="/login" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
