"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LeaderboardView } from "./leaderboards";
import { BidForm } from "./bid-form";
import { useAuth } from "@/auth/auth-provider";
import { ChevronRight } from "lucide-react";
import type { Scope } from "@/types/api";
import { REAL_CATEGORIES } from "@/types/categories";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

function BidInner({
  initialScope,
  initialState,
  initialCategory,
}: {
  initialScope: Scope;
  initialState: string;
  initialCategory: string;
}) {
  const { user } = useAuth();
  const [scope, setScope] = useState<Scope>(initialScope);
  const [state, setState] = useState<string>(initialState);
  const [categorySlug, setCategorySlug] = useState<string>(initialCategory);

  const activeCategory =
    REAL_CATEGORIES.find((c) => c.slug === categorySlug) || REAL_CATEGORIES[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar user={user} />

      {/* Breadcrumb bar */}
      <div className="max-w-7xl w-full mx-auto px-4 pt-6 sm:px-6">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-xs text-muted-foreground">
          <span>Leaderboards</span>
          <ChevronRight className="h-3 w-3" />
          <span className="font-semibold text-foreground">{activeCategory.name}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-primary font-medium">
            {scope === "NATIONAL" ? "National" : state}
          </span>
        </div>
      </div>

      {/* Main Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:px-6">
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

      <Footer />
    </div>
  );
}

function BidContent() {
  const searchParams = useSearchParams();
  const rawScope = searchParams.get("scope")?.toUpperCase();
  const initialScope: Scope = rawScope === "STATE" ? "STATE" : "NATIONAL";
  const initialState = searchParams.get("state") || "Delhi";
  const initialCategory =
    searchParams.get("categorySlug") || REAL_CATEGORIES[0].slug;

  return (
    <BidInner
      key={searchParams.toString()}
      initialScope={initialScope}
      initialState={initialState}
      initialCategory={initialCategory}
    />
  );
}

export default function BidPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-xs text-muted-foreground">
          Loading leaderboard…
        </div>
      }
    >
      <BidContent />
    </Suspense>
  );
}
