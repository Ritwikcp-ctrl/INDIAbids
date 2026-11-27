"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search, Globe, MapPin, ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { REAL_CATEGORIES } from "@/types/categories";
import { ALL_INDIAN_STATES } from "@/types/states";
import {
  CATEGORY_GROUPS,
  CATEGORY_ICON_MAP,
  FALLBACK_CATEGORY_ICON,
} from "@/lib/category-meta";

export default function CategoriesPage() {
  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [scope, setScope] = useState<"national" | "state">("national");
  const [selectedState, setSelectedState] = useState<string>("Delhi");

  const slugToGroup = useMemo(() => {
    const map = new Map<string, string>();
    for (const g of CATEGORY_GROUPS) {
      for (const s of g.slugs) map.set(s, g.id);
    }
    return map;
  }, []);

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return REAL_CATEGORIES.map((cat, idx) => ({
      ...cat,
      index: idx + 1,
      groupId: slugToGroup.get(cat.slug) ?? "other",
    })).filter((cat) => {
      if (activeGroup !== "all" && cat.groupId !== activeGroup) return false;
      if (!q) return true;
      return (
        cat.name.toLowerCase().includes(q) ||
        cat.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeGroup, slugToGroup]);

  const buildBoardHref = (slug: string) =>
    scope === "national"
      ? `/bid?scope=national&categorySlug=${slug}`
      : `/bid?scope=state&state=${encodeURIComponent(selectedState)}&categorySlug=${slug}`;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {/* Header Banner */}
        <section className="border-b border-border/70 bg-card/30 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <Badge
                  variant="outline"
                  className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
                >
                  All 23 Industry Sectors
                </Badge>
                <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                  Browse Every Category Leaderboard
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Each sector runs an independent National Board (₹500 min bid) and 36 State &amp; UT Boards (₹100 min bid). Pick a category to inspect live rankings or claim Rank #1.
                </p>
              </div>

              {/* Scope Switcher */}
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm">
                <button
                  type="button"
                  onClick={() => setScope("national")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                    scope === "national"
                      ? "bg-[#FF4D1F] text-white dark:text-[#111013]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Globe className="h-3.5 w-3.5" />
                  National (₹500 Min)
                </button>
                <button
                  type="button"
                  onClick={() => setScope("state")}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                    scope === "state"
                      ? "bg-[#FF4D1F] text-white dark:text-[#111013]"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  State Board (₹100 Min)
                </button>

                {scope === "state" && (
                  <Select value={selectedState} onValueChange={setSelectedState}>
                    <SelectTrigger className="h-8 w-[160px] rounded-xl text-xs bg-background">
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
                )}
              </div>
            </div>

            {/* Search & Group Filter Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
              <div className="relative w-full md:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search categories (e.g. Podcasts, Dhaba, SaaS)…"
                  className="h-10 pl-9 text-xs rounded-xl bg-background"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveGroup("all")}
                  className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    activeGroup === "all"
                      ? "bg-foreground text-background"
                      : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  All ({REAL_CATEGORIES.length})
                </button>
                {CATEGORY_GROUPS.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setActiveGroup(g.id)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeGroup === g.id
                        ? "bg-foreground text-background"
                        : "border border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Categories Grid */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {filteredCategories.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center space-y-3">
              <p className="text-sm font-semibold text-foreground">
                No categories match &ldquo;{query}&rdquo;
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  setQuery("");
                  setActiveGroup("all");
                }}
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat) => {
                const icon =
                  CATEGORY_ICON_MAP[cat.slug] ?? FALLBACK_CATEGORY_ICON;
                return (
                  <div
                    key={cat.slug}
                    className="card-surface rounded-2xl p-5 flex flex-col justify-between hover:border-[#FF4D1F]/45 transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF4D1F]/10 text-[#FF4D1F]">
                          <HugeiconsIcon
                            icon={icon}
                            size={18}
                            strokeWidth={1.8}
                          />
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-semibold text-[#FF4D1F]">
                            Sector #{cat.index < 10 ? `0${cat.index}` : cat.index}
                          </span>
                          <Badge variant="secondary" className="text-[10px] font-normal">
                            {scope === "national" ? "National" : selectedState}
                          </Badge>
                        </div>
                      </div>

                      <h2 className="text-base font-bold text-foreground group-hover:text-[#FF4D1F] transition-colors">
                        {cat.name}
                      </h2>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {cat.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border/60 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Min bid{" "}
                        <strong className="text-foreground">
                          {scope === "national" ? "₹500" : "₹100"}
                        </strong>
                      </span>
                      <Button
                        asChild
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs font-semibold group-hover:bg-[#FF4D1F] group-hover:text-white dark:group-hover:text-[#111013] transition-colors"
                      >
                        <Link href={buildBoardHref(cat.slug)}>
                          View Board
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
