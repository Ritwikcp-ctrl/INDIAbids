"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import  HeroHeader  from "@/components/ui/main-heading";
import { ALL_INDIAN_STATES } from "@/types/states";
import { REAL_CATEGORIES } from "@/types/categories";


interface HeroProps {
  heroCategory: string;
  setHeroCategory: (v: string) => void;
  heroScope: "national" | "state";
  setHeroScope: (v: "national" | "state") => void;
  heroState: string;
  setHeroState: (v: string) => void;
  handleHeroNavigate: (e: React.FormEvent) => void;
}

export function Hero({
  heroCategory,
  setHeroCategory,
  heroScope,
  setHeroScope,
  heroState,
  setHeroState,
  handleHeroNavigate,
}: HeroProps) {
  return (
    /* ── STAGE: Carbon Ink canvas with two soft light leaks ── */
    <section className="relative overflow-hidden border-b border-white/[0.06] bg-[#111013] px-4 py-24 sm:px-6 sm:py-28">
      {/* Signal Orange leak — top center */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] opacity-50 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(255,77,31,0.35), transparent 70%)",
        }}
      />
      {/* Electric Cobalt leak — bottom right */}
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 right-0 h-[360px] w-[520px] opacity-40 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(47,107,255,0.28), transparent 70%)",
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center space-y-7 text-center">
          {/* ── PILL BADGE — the only small element with an accent dot ── */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-[11.5px] font-medium tracking-[-0.005em] text-[#EDE7DC]/70 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset] backdrop-blur-md">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FE0A0] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3FE0A0]" />
            </span>
            <span>
              Verified Paid Leaderboard · 23 Categories · 36 States &amp; UTs
            </span>
          </div>

          {/* ── HEADLINE ── */}
          <div className="[&_h1]:!text-[#EDE7DC] [&_h1]:!tracking-[-0.03em] [&_span]:!text-[#FF4D1F]">
            <HeroHeader />
          </div>

          {/* ── SUBHEAD ── */}
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#EDE7DC]/60 sm:text-[16px]">
            Businesses and creators bid for rank within their industry across
            independent National and State boards. No subscriptions. Permanent
            cumulative spend. Instant fulfillment.
          </p>

          {/* ── GLASS COMMAND BAR ── */}
          <div className="mx-auto mt-6 w-full max-w-3xl">
            <div className="rounded-[26px] border border-white/[0.08] bg-[#111013]/70 p-2 shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl backdrop-saturate-150">
              <form
                onSubmit={handleHeroNavigate}
                className="grid grid-cols-1 gap-2 sm:grid-cols-4"
              >
                {/* Category */}
                <div className="text-left sm:col-span-2">
                  <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#EDE7DC]/40">
                    Category
                  </label>
                  <Select value={heroCategory} onValueChange={setHeroCategory}>
                    <SelectTrigger className="h-10 w-full rounded-2xl border-white/[0.06] bg-white/[0.03] text-xs text-[#EDE7DC] hover:bg-white/[0.05] focus:ring-[#FF4D1F]/40">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 border-white/10 bg-[#1A171C] text-[#EDE7DC]">
                      {REAL_CATEGORIES.map((c) => (
                        <SelectItem
                          key={c.slug}
                          value={c.slug}
                          className="text-xs focus:bg-[#FF4D1F]/15 focus:text-[#FF4D1F]"
                        >
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Scope */}
                <div className="text-left">
                  <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#EDE7DC]/40">
                    Scope
                  </label>
                  <Select
                    value={heroScope}
                    onValueChange={(v) =>
                      setHeroScope(v as "national" | "state")
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-2xl border-white/[0.06] bg-white/[0.03] text-xs text-[#EDE7DC] hover:bg-white/[0.05] focus:ring-[#FF4D1F]/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-[#1A171C] text-[#EDE7DC]">
                      <SelectItem
                        value="national"
                        className="text-xs focus:bg-[#FF4D1F]/15 focus:text-[#FF4D1F]"
                      >
                        National (All-India)
                      </SelectItem>
                      <SelectItem
                        value="state"
                        className="text-xs focus:bg-[#FF4D1F]/15 focus:text-[#FF4D1F]"
                      >
                        State Board
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State or Action */}
                <div className="flex flex-col justify-end text-left">
                  {heroScope === "state" ? (
                    <div>
                      <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#EDE7DC]/40">
                        State / UT
                      </label>
                      <Select value={heroState} onValueChange={setHeroState}>
                        <SelectTrigger className="h-10 w-full rounded-2xl border-white/[0.06] bg-white/[0.03] text-xs text-[#EDE7DC] hover:bg-white/[0.05] focus:ring-[#FF4D1F]/40">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 border-white/10 bg-[#1A171C] text-[#EDE7DC]">
                          {ALL_INDIAN_STATES.map((s) => (
                            <SelectItem
                              key={s}
                              value={s}
                              className="text-xs focus:bg-[#FF4D1F]/15 focus:text-[#FF4D1F]"
                            >
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Button
                      type="submit"
                      className="group h-10 w-full rounded-2xl bg-[#FF4D1F] text-xs font-semibold text-[#111013] shadow-[0_8px_24px_-12px_rgba(255,77,31,0.8)] transition-all duration-200 hover:bg-[#E84317]"
                    >
                      View Board
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  )}
                </div>
              </form>

              {heroScope === "state" && (
                <div className="mt-2 flex justify-end border-t border-white/[0.06] px-2 pt-2">
                  <Button
                    onClick={handleHeroNavigate}
                    className="group h-9 rounded-2xl bg-[#FF4D1F] px-6 text-xs font-semibold text-[#111013] shadow-[0_8px_24px_-12px_rgba(255,77,31,0.8)] transition-all duration-200 hover:bg-[#E84317]"
                  >
                    View {heroState} Board
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── METRICS — hairline-divided, no boxes ── */}
          <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-2 gap-y-8 border-t border-white/[0.06] pt-8 sm:grid-cols-4 sm:divide-x sm:divide-white/[0.06]">
            {[
              { value: "23", label: "Industry Sectors", accent: false },
              { value: "36", label: "States & UTs Covered", accent: false },
              {
                value: "₹500 / ₹100",
                label: "National / State Min Bid",
                accent: false,
              },
              {
                value: "0%",
                label: "Recurring Subscriptions",
                accent: true,
              },
            ].map((m) => (
              <div key={m.label} className="px-2">
                <p
                  className={[
                    "text-2xl font-bold tracking-[-0.02em] sm:text-[26px]",
                    m.accent ? "text-[#3FE0A0]" : "text-[#EDE7DC]",
                  ].join(" ")}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] tracking-[0.01em] text-[#EDE7DC]/45">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    
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
      </section>


  );
}