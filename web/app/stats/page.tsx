"use client";

import Link from "next/link";
import { ArrowRight, Globe, Layers, MapPin, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBoards, useCategories } from "@/api/hooks";
import { REAL_CATEGORIES } from "@/types/categories";
import { ALL_INDIAN_STATES } from "@/types/states";
import { CATEGORY_GROUPS } from "@/lib/category-meta";

export default function StatsPage() {
  const { data: catData } = useCategories();
  const { data: nationalBoardsData } = useBoards({ scope: "NATIONAL" });
  const { data: stateBoardsData } = useBoards({ scope: "STATE" });

  const categoryCount = catData?.categories?.length ?? REAL_CATEGORIES.length;
  const nationalCount = nationalBoardsData?.boards?.length ?? REAL_CATEGORIES.length;
  const stateCount =
    stateBoardsData?.boards?.length ??
    REAL_CATEGORIES.length * ALL_INDIAN_STATES.length;
  const totalBoards = nationalCount + stateCount;

  const headlineStats = [
    {
      label: "Active Industry Sectors",
      value: String(categoryCount),
      detail: "Curated categories across media, tech, local & commerce",
      icon: Layers,
    },
    {
      label: "National Boards",
      value: String(nationalCount),
      detail: "₹500 minimum bid · All-India reach",
      icon: Globe,
    },
    {
      label: "State & UT Boards",
      value: String(stateCount),
      detail: `₹100 minimum bid · ${ALL_INDIAN_STATES.length} States & UTs`,
      icon: MapPin,
    },
    {
      label: "Total Independent Ledgers",
      value: totalBoards.toLocaleString("en-IN"),
      detail: "Zero subscriptions · Permanent cumulative spend",
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-card/30 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-5xl flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <Badge
                variant="outline"
                className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
              >
                Platform Metrics
              </Badge>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                INDIAbids Network Stats
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Live structural overview of categories, National &amp; State leaderboards, and deterministic entry thresholds across India.
              </p>
            </div>

            <Button
              asChild
              className="rounded-full bg-[#FF4D1F] px-5 text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317]"
            >
              <Link href="/bid?scope=national">
                Inspect Live Boards <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 space-y-10">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {headlineStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="card-surface rounded-2xl p-5 space-y-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4D1F]/10 text-[#FF4D1F]">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
                      {stat.value}
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-1">
                      {stat.label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                      {stat.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Sector Group Breakdown */}
          <div className="card-surface rounded-2xl p-6 sm:p-8 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Sector Group Distribution
                </h2>
                <p className="text-xs text-muted-foreground">
                  Every category runs 1 National board and {ALL_INDIAN_STATES.length} State/UT boards.
                </p>
              </div>
              <Link
                href="/categories"
                className="text-xs font-semibold text-[#FF4D1F] hover:underline"
              >
                Browse All Categories →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CATEGORY_GROUPS.map((group) => (
                <div
                  key={group.id}
                  className="rounded-xl border border-border/70 bg-background/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-foreground">{group.label}</h3>
                    <Badge variant="secondary" className="text-[10px]">
                      {group.slugs.length} Sectors
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.slugs.map((slug) => {
                      const cat = REAL_CATEGORIES.find((c) => c.slug === slug);
                      if (!cat) return null;
                      return (
                        <Link
                          key={slug}
                          href={`/bid?scope=national&categorySlug=${slug}`}
                          className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-[#FF4D1F]/50 hover:text-[#FF4D1F]"
                        >
                          {cat.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
