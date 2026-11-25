"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { LeaderboardView } from "./leaderboards";
import { BidForm } from "./bid-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/auth-provider";
import { ArrowLeft, ChevronRight, ShieldCheck } from "lucide-react";
import type { Scope } from "@/types/api";
import { REAL_CATEGORIES } from "@/types/categories";
import { ThemeToggle } from "@/components/theme-toggle";

function BidContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const initialScope = (searchParams.get("scope")?.toUpperCase() as Scope) || "NATIONAL";
  const initialState = searchParams.get("state") || "Delhi";
  const initialCategory = searchParams.get("categorySlug") || REAL_CATEGORIES[0].slug;

  const [scope, setScope] = useState<Scope>(initialScope);
  const [state, setState] = useState<string>(initialState);
  const [categorySlug, setCategorySlug] = useState<string>(initialCategory);

  useEffect(() => {
    const s = searchParams.get("scope")?.toUpperCase();
    if (s === "NATIONAL" || s === "STATE") setScope(s);
    const st = searchParams.get("state");
    if (st) setState(st);
    const cat = searchParams.get("categorySlug");
    if (cat) setCategorySlug(cat);
  }, [searchParams]);

  const activeCategory = REAL_CATEGORIES.find((c) => c.slug === categorySlug) || REAL_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm tracking-tight shadow-sm">
                IB
              </span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                INDIA<span className="text-primary font-black">bids</span>
              </span>
            </Link>

            {/* Breadcrumb indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground border-l border-border pl-3 ml-2">
              <span>Leaderboards</span>
              <ChevronRight className="h-3 w-3" />
              <span className="font-semibold text-foreground">{activeCategory.name}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-primary font-medium">
                {scope === "NATIONAL" ? "National" : state}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/">
                <ArrowLeft className="mr-1.5 h-3.5 w-3.5" /> Back to Home
              </Link>
            </Button>
            {user ? (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <Link href="/login">Sign In</Link>
              </Button>
            )}

            {/* Theme Toggle Button on Right Corner */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1.65fr_1fr] items-start">
          {/* Left Column: Leaderboard View with Dropdowns */}
          <div>
            <LeaderboardView
              categorySlug={categorySlug}
              scope={scope}
              state={state}
              onScopeChange={setScope}
              onStateChange={setState}
              onCategoryChange={setCategorySlug}
            />
          </div>

          {/* Right Column: Sticky Bid Console */}
          <aside className="lg:sticky lg:top-24">
            <BidForm
              scope={scope}
              state={state}
              categorySlug={categorySlug}
              onCategoryChange={setCategorySlug}
            />
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/40 py-8 px-4 sm:px-6 text-center text-xs text-muted-foreground">
        <p>INDIAbids &copy; {new Date().getFullYear()} — Deterministic Rank Architecture</p>
      </footer>
    </div>
  );
}

export default function BidPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading leaderboard…</div>}>
      <BidContent />
    </Suspense>
  );
}
