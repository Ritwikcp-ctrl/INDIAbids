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
import { Globe, MapPin } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Hero } from "@/components/ui/hero";
import { SocialProof } from "@/components/ui/social-proof";
import { Footer } from "@/components/ui/footer";
import { Reveal } from "@/components/ui/reveal";

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

  function handleHeroNavigate(e: React.FormEvent) {
    e.preventDefault();
    if (heroScope === "national") {
      router.push(`/bid?scope=national&categorySlug=${heroCategory}`);
    } else {
      router.push(
        `/bid?scope=state&state=${encodeURIComponent(heroState)}&categorySlug=${heroCategory}`
      );
    }
  }

  function handleCalculate(e: React.FormEvent) {
    e.preventDefault();
    if (!calcUrl.trim()) return;

    const cat =
      REAL_CATEGORIES.find((c) => c.slug === calcCategory) || REAL_CATEGORIES[0];
    setCalcResult({
      minBid: calcScope === "national" ? 500 : 100,
      categoryName: cat.name,
      targetBoard:
        calcScope === "national" ? "National Board" : `State Board (${calcState})`,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
      {/* 1. NAVIGATION BAR */}
      <Navbar user={user} />

      {/* 2. HERO SECTION */}
      <Hero
        heroCategory={heroCategory}
        setHeroCategory={setHeroCategory}
        heroScope={heroScope}
        setHeroScope={setHeroScope}
        heroState={heroState}
        setHeroState={setHeroState}
        handleHeroNavigate={handleHeroNavigate}
      />

      {/* 3. HOW IT WORKS */}
      <section
        id="how-it-works"
        className="py-20 px-4 sm:px-6 bg-card/40 border-y border-border/60"
      >
        <div className="max-w-5xl mx-auto">
          <Reveal className="text-center max-w-2xl mx-auto mb-14">
            <Badge
              variant="outline"
              className="text-xs font-semibold uppercase tracking-wider mb-2"
            >
              Three-Step Architecture
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              How INDIAbids Operates
            </h2>
            <p className="text-sm text-muted-foreground mt-2">
              A transparent, deterministic protocol where verified spend defines rank without hidden algorithms.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Select Scope & Board",
                body: "Choose between the All-India National Board (₹500 min bid) or your state board (₹100 min bid). Each board maintains its own spend ladder.",
              },
              {
                step: "02",
                title: "Place Your Bid Instantly",
                body: "Pay securely via UPI or cards. Auth is optional: anonymous bidders receive a cryptographic token to manage or raise bids later.",
              },
              {
                step: "03",
                title: "Compound & Defend Rank",
                body: "Every rupee you spend accumulates permanently. If a competitor bids higher, you can reclaim Rank #1 by simply paying the difference.",
              },
            ].map((item, idx) => (
              <Reveal key={item.step} delay={idx * 0.06}>
                <div className="card-surface h-full rounded-xl p-6 space-y-3 transition-transform duration-200 hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm">
                    {item.step}
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. TWO INDEPENDENT BOARDS BREAKDOWN */}
      <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto w-full">
        <Reveal className="text-center max-w-xl mx-auto mb-12">
          <Badge
            variant="outline"
            className="text-xs font-semibold uppercase tracking-wider mb-2"
          >
            Dual Board Architecture
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            National vs State Strategy
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            Businesses can compete on both boards simultaneously with separate spend totals.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Reveal delay={0}>
            <div className="card-surface h-full rounded-xl p-6 border-l-4 border-l-primary flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                    <Globe className="h-4 w-4" /> NATIONAL LEADERBOARD
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    ₹500 Min
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">Pan-India Reach</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Built for digital products, D2C brands, nationwide agencies, and startups seeking national attention. Compete across all 1.4 billion people with a single cumulative ranking.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <Button
                  asChild
                  size="sm"
                  className="w-full text-xs font-semibold active:scale-[0.98]"
                >
                  <Link href="/bid?scope=national">Enter National Board →</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <div className="card-surface h-full rounded-xl p-6 border-l-4 border-l-emerald-500 flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 dark:text-emerald-400">
                    <MapPin className="h-4 w-4" /> STATE LEADERBOARDS
                  </span>
                  <span className="text-xs font-semibold text-foreground">
                    ₹100 Min
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Hyperlocal Dominance
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Ideal for local businesses, restaurants, dhabas, regional services, and creators targeting audiences within Delhi, Maharashtra, Karnataka, or any of India&apos;s 36 states and UTs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/50">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="w-full text-xs font-semibold active:scale-[0.98]"
                >
                  <Link href="/bid?scope=state&state=Delhi">Enter State Boards →</Link>
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 5. RANK ESTIMATOR TOOL */}
      <section className="py-20 px-4 sm:px-6 bg-card/40 border-t border-border/60">
        <div className="max-w-3xl mx-auto">
          <Reveal className="text-center mb-10">
            <Badge
              variant="outline"
              className="text-xs font-semibold uppercase tracking-wider mb-2"
            >
              Rank Calculator
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Calculate Your Entry Requirement
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select your target category and scope to see what it takes to secure Rank #1.
            </p>
          </Reveal>

          <Reveal delay={0.06}>
            <form
              onSubmit={handleCalculate}
              className="card-surface rounded-xl p-6 space-y-4 shadow-lg"
            >
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
                  <Button
                    type="submit"
                    size="sm"
                    className="h-9 px-5 text-xs font-semibold shrink-0 active:scale-[0.98]"
                  >
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
                      <span className="text-xs font-bold text-foreground">
                        {calcUrl}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Target: {calcResult.categoryName} · {calcResult.targetBoard}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground block">
                        Minimum Bid
                      </span>
                      <span className="text-base font-bold text-foreground">
                        {formatInr(calcResult.minBid)}
                      </span>
                    </div>
                    <Button
                      asChild
                      size="sm"
                      className="text-xs font-semibold shadow-sm active:scale-[0.98]"
                    >
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
          </Reveal>
        </div>
      </section>

      {/* 6. TESTIMONIALS / SOCIAL PROOF MARQUEE */}
      <Reveal>
        <SocialProof />
      </Reveal>

      {/* 7. FOOTER */}
      <Footer />
    </div>
  );
}
