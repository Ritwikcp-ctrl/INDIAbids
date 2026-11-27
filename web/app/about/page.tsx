"use client";

import Link from "next/link";
import { ArrowRight, Globe, MapPin, ShieldCheck, Zap, Layers } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const pillars = [
    {
      icon: Zap,
      title: "Deterministic Rank Protocol",
      body: "No opaque relevance algorithms, quality scores, or shadow bans. Rank on every board is strictly ordered by lifetime cumulative verified spend—highest total holds #1, with earlier transactions breaking ties.",
    },
    {
      icon: Globe,
      title: "Dual National & State Boards",
      body: "Compete pan-India on the National Board (₹500 minimum bid) or dominate local intent across any of India's 36 states and union territories on State Boards (₹100 minimum bid). Spend totals stay independent per board.",
    },
    {
      icon: ShieldCheck,
      title: "Optional Auth & Manage Keys",
      body: "Bid immediately without creating an account. Every anonymous listing generates a cryptographic one-time manage link so you can raise bids later—or claim the listing to a dashboard account whenever you choose.",
    },
    {
      icon: Layers,
      title: "Permanent Cumulative Spend",
      body: "Zero recurring monthly fees or expiring placements. Every rupee you spend compounds permanently. If someone outbids you, you only pay the difference to reclaim Rank #1.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-border/70 bg-card/30 px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-4xl space-y-5">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
            >
              About INDIAbids
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-[1.12]">
              Rank is what you pay.{" "}
              <span className="text-[#FF4D1F]">Relevance is where you compete.</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
              INDIAbids is an open, transparent paid leaderboard built for Indian startups, local businesses, creators, and agencies. Instead of renting fleeting impressions in complex ad auctions, businesses compete openly within 23 curated sectors across National and State boards.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                asChild
                className="rounded-full bg-[#FF4D1F] text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317]"
              >
                <Link href="/bid?scope=national">
                  Explore Live Boards <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full text-xs font-semibold">
                <Link href="/categories">Browse All 23 Categories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Architecture Pillars */}
        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={pillar.title}
                  className="card-surface rounded-2xl p-6 space-y-3"
                >
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FF4D1F]/10 text-[#FF4D1F]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h2 className="text-base font-bold text-foreground">
                    {pillar.title}
                  </h2>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.body}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Numbers strip */}
          <div className="mt-12 rounded-2xl border border-border bg-card p-6 sm:p-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-extrabold text-foreground">23</p>
              <p className="text-xs text-muted-foreground mt-1">Industry Sectors</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-foreground">36</p>
              <p className="text-xs text-muted-foreground mt-1">States &amp; UTs</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-[#FF4D1F]">₹100</p>
              <p className="text-xs text-muted-foreground mt-1">State Board Min</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-500">0%</p>
              <p className="text-xs text-muted-foreground mt-1">Subscriptions</p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-[#FF4D1F]/25 bg-[#FF4D1F]/[0.06] p-6">
            <div className="space-y-1 text-center sm:text-left">
              <p className="text-sm font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                <MapPin className="h-4 w-4 text-[#FF4D1F]" />
                Ready to claim your industry spot?
              </p>
              <p className="text-xs text-muted-foreground">
                Pick a category and place an instant UPI or card bid via Razorpay.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-[#FF4D1F] px-5 text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317]"
            >
              <Link href="/bid?scope=national">
                Place a Bid <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
