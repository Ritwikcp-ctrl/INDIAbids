"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ArrowRight, ChevronDown, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import HeroHeader from "@/components/ui/main-heading";
import BranchedMenu, { type BranchedMenuItem } from "@/components/ui/branched-menu";
import { ALL_INDIAN_STATES } from "@/types/states";
import { REAL_CATEGORIES } from "@/types/categories";
import {
  CATEGORY_GROUPS,
  CATEGORY_ICON_MAP,
  FALLBACK_CATEGORY_ICON,
} from "@/lib/category-meta";

interface HeroProps {
  heroCategory: string;
  setHeroCategory: (v: string) => void;
  heroScope: "national" | "state";
  setHeroScope: (v: "national" | "state") => void;
  heroState: string;
  setHeroState: (v: string) => void;
  handleHeroNavigate: (e: React.FormEvent) => void;
}

const emptySubscribe = () => () => {};

export function Hero({
  heroCategory,
  setHeroCategory,
  heroScope,
  setHeroScope,
  heroState,
  setHeroState,
  handleHeroNavigate,
}: HeroProps) {
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!categoriesOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCategoriesOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [categoriesOpen]);

  const isDark = !mounted || resolvedTheme === "dark";

  const branchedCategoryItems: BranchedMenuItem[] = useMemo(() => {
    const bySlug = new Map(REAL_CATEGORIES.map((c) => [c.slug, c]));
    return CATEGORY_GROUPS.map((group) => ({
      label: group.label,
      children: group.slugs
        .map((slug) => bySlug.get(slug))
        .filter((c): c is NonNullable<typeof c> => Boolean(c))
        .map((cat) => ({
          value: cat.slug,
          label: cat.name,
          icon: CATEGORY_ICON_MAP[cat.slug] ?? FALLBACK_CATEGORY_ICON,
          href: `/bid?scope=national&categorySlug=${cat.slug}`,
        })),
    }));
  }, []);

  const activeCategoryName =
    REAL_CATEGORIES.find((c) => c.slug === heroCategory)?.name ??
    REAL_CATEGORIES[0].name;

  return (
    /* ── STAGE: Theme-aware Bone / Carbon Ink canvas with soft light leaks ── */
    <section className="relative border-b border-black/[0.08] bg-[#FAF6F0] px-4 py-20 transition-colors duration-300 dark:border-white/[0.06] dark:bg-[#111013] sm:px-6 sm:py-24">
      {/* Light leak backdrop clipped cleanly so dropdowns never clip */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* Signal Orange leak — top center */}
        <div
          className="absolute inset-x-0 -top-40 h-[420px] opacity-25 blur-3xl dark:opacity-50"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(255,77,31,0.35), transparent 70%)",
          }}
        />
        {/* Electric Cobalt leak — bottom right */}
        <div
          className="absolute -bottom-32 right-0 h-[360px] w-[520px] opacity-20 blur-3xl dark:opacity-40"
          style={{
            background:
              "radial-gradient(50% 50% at 50% 50%, rgba(47,107,255,0.28), transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="flex flex-col items-center space-y-7 text-center">
          {/* ── PILL BADGE ── */}
          <div className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/75 px-3.5 py-1.5 text-[11.5px] font-medium tracking-[-0.005em] text-[#1B171C]/75 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset] backdrop-blur-md dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-[#EDE7DC]/70 dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3FE0A0] opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#3FE0A0]" />
            </span>
            <span>
              Verified Paid Leaderboard · 23 Categories · 36 States &amp; UTs
            </span>
          </div>

          {/* ── HEADLINE (FlipText) ── */}
          <HeroHeader />

          {/* ── SUBHEAD ── */}
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[#1B171C]/70 dark:text-[#EDE7DC]/60 sm:text-[16px]">
            Businesses and creators bid for rank within their industry across
            independent National and State boards. No subscriptions. Permanent
            cumulative spend. Instant fulfillment.
          </p>

          {/* ── GLASS COMMAND BAR ── */}
          <div className="mx-auto mt-6 w-full max-w-3xl">
            <div className="rounded-[26px] border border-black/[0.08] bg-white/80 p-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_24px_60px_-30px_rgba(27,23,28,0.18)] backdrop-blur-2xl backdrop-saturate-150 dark:border-white/[0.08] dark:bg-[#111013]/70 dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_30px_80px_-40px_rgba(0,0,0,0.9)]">
              <form
                onSubmit={handleHeroNavigate}
                className="grid grid-cols-1 gap-2 sm:grid-cols-4"
              >
                {/* Category */}
                <div className="text-left sm:col-span-2">
                  <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#1B171C]/55 dark:text-[#EDE7DC]/40">
                    Category
                  </label>
                  <Select value={heroCategory} onValueChange={setHeroCategory}>
                    <SelectTrigger className="h-10 w-full rounded-2xl border-black/[0.08] bg-black/[0.03] text-xs text-[#1B171C] hover:bg-black/[0.05] focus:ring-[#FF4D1F]/40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-[#EDE7DC] dark:hover:bg-white/[0.05]">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60 border-border bg-popover text-popover-foreground">
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
                  <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#1B171C]/55 dark:text-[#EDE7DC]/40">
                    Scope
                  </label>
                  <Select
                    value={heroScope}
                    onValueChange={(v) =>
                      setHeroScope(v as "national" | "state")
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-2xl border-black/[0.08] bg-black/[0.03] text-xs text-[#1B171C] hover:bg-black/[0.05] focus:ring-[#FF4D1F]/40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-[#EDE7DC] dark:hover:bg-white/[0.05]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border-border bg-popover text-popover-foreground">
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
                      <label className="mb-1.5 block px-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#1B171C]/55 dark:text-[#EDE7DC]/40">
                        State / UT
                      </label>
                      <Select value={heroState} onValueChange={setHeroState}>
                        <SelectTrigger className="h-10 w-full rounded-2xl border-black/[0.08] bg-black/[0.03] text-xs text-[#1B171C] hover:bg-black/[0.05] focus:ring-[#FF4D1F]/40 dark:border-white/[0.06] dark:bg-white/[0.03] dark:text-[#EDE7DC] dark:hover:bg-white/[0.05]">
                          <SelectValue placeholder="Select State" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 border-border bg-popover text-popover-foreground">
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
                      className="group h-10 w-full rounded-2xl bg-[#FF4D1F] text-xs font-semibold text-white shadow-[0_8px_24px_-12px_rgba(255,77,31,0.8)] transition-all duration-200 hover:bg-[#E84317] dark:text-[#111013]"
                    >
                      View Board
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Button>
                  )}
                </div>
              </form>

              {heroScope === "state" && (
                <div className="mt-2 flex justify-end border-t border-black/[0.06] px-2 pt-2 dark:border-white/[0.06]">
                  <Button
                    onClick={handleHeroNavigate}
                    className="group h-9 rounded-2xl bg-[#FF4D1F] px-6 text-xs font-semibold text-white shadow-[0_8px_24px_-12px_rgba(255,77,31,0.8)] transition-all duration-200 hover:bg-[#E84317] dark:text-[#111013]"
                  >
                    View {heroState} Board
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* ── BROWSE CATEGORIES BRANCHED MENU DROPDOWN ── */}
          <div id="categories" ref={dropdownRef} className="relative z-30 flex flex-col items-center">
            <button
              type="button"
              onClick={() => setCategoriesOpen((prev) => !prev)}
              aria-expanded={categoriesOpen}
              className={[
                "inline-flex cursor-pointer items-center gap-2.5 rounded-full border px-5 py-2.5 text-xs font-semibold transition-all duration-200 backdrop-blur-md",
                categoriesOpen
                  ? "border-[#FF4D1F]/50 bg-[#FF4D1F]/10 text-[#FF4D1F]"
                  : "border-black/[0.08] bg-white/75 text-[#1B171C]/85 hover:border-[#FF4D1F]/40 hover:text-[#1B171C] dark:border-white/[0.1] dark:bg-white/[0.04] dark:text-[#EDE7DC]/85 dark:hover:border-[#FF4D1F]/40 dark:hover:text-[#EDE7DC]",
              ].join(" ")}
            >
              <Layers className="h-3.5 w-3.5 text-[#FF4D1F]" />
              <span>Browse All 23 Categories</span>
              <span className="hidden rounded-full bg-black/[0.05] px-2.5 py-0.5 text-[10.5px] font-medium text-[#1B171C]/65 dark:bg-white/[0.07] dark:text-[#EDE7DC]/65 sm:inline">
                {activeCategoryName}
              </span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform duration-200 ${
                  categoriesOpen ? "rotate-180 text-[#FF4D1F]" : ""
                }`}
              />
            </button>

            {categoriesOpen && (
              <div className="mt-3 w-[min(660px,calc(100vw-1.5rem))] rounded-3xl border border-black/[0.1] bg-white/95 p-5 sm:p-7 text-left shadow-[0_28px_80px_-24px_rgba(27,23,28,0.3)] backdrop-blur-2xl dark:border-white/[0.12] dark:bg-[#17141A]/95 dark:shadow-[0_36px_96px_-25px_rgba(0,0,0,0.95)]">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/[0.07] pb-3.5 dark:border-white/[0.08]">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#FF4D1F]">
                      Industry Leaderboards · 23 Sectors
                    </p>
                    <p className="text-xs text-[#1B171C]/65 dark:text-[#EDE7DC]/60 mt-0.5">
                      Pick a sector to open its live National board, or explore the full directory
                    </p>
                  </div>
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-1 rounded-full bg-[#FF4D1F]/10 px-3 py-1.5 text-xs font-semibold text-[#FF4D1F] transition-colors hover:bg-[#FF4D1F] hover:text-white dark:hover:text-[#111013]"
                    onClick={() => setCategoriesOpen(false)}
                  >
                    View All →
                  </Link>
                </div>

                <div className="max-h-[540px] overflow-x-auto overflow-y-auto pr-2">
                  <BranchedMenu
                    items={branchedCategoryItems}
                    defaultOpen={[0, 1]}
                    defaultActive={heroCategory}
                    onSelect={(value) => {
                      setHeroCategory(value);
                      setCategoriesOpen(false);
                    }}
                    color={isDark ? "#EDE7DC" : "#1B171C"}
                    accentColor="#FF4D1F"
                    lineColor={isDark ? "#3f3f46" : "#CFC6B8"}
                    width={580}
                    rowHeight={40}
                    indent={44}
                    trunk={16}
                    radius={11}
                    lineWidth={1.6}
                    fontSize={14.5}
                    drawDuration={350}
                    foldDuration={280}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ── METRICS — hairline-divided, no boxes ── */}
          <div className="mx-auto mt-10 grid w-full max-w-3xl grid-cols-2 gap-y-8 border-t border-black/[0.08] pt-8 dark:border-white/[0.06] sm:grid-cols-4 sm:divide-x sm:divide-black/[0.08] sm:dark:divide-white/[0.06]">
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
                    m.accent
                      ? "text-emerald-600 dark:text-[#3FE0A0]"
                      : "text-[#1B171C] dark:text-[#EDE7DC]",
                  ].join(" ")}
                >
                  {m.value}
                </p>
                <p className="mt-1 text-[11px] tracking-[0.01em] text-[#1B171C]/55 dark:text-[#EDE7DC]/45">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
