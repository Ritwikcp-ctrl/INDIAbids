"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { REAL_CATEGORIES } from "@/types/categories";
import { ArrowUpRight, Search, Terminal, Cpu } from "lucide-react";

export function TensionFeed() {
  const [search, setSearch] = useState("");

  const filteredCategories = REAL_CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section id="cyber-categories" className="scroll-mt-8 border-t border-cyan-500/20 px-4 py-20 sm:px-6 relative">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-cyan-400">
                INDUSTRY MATRIX // ALL 23 SECTORS
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-foreground">
              Every Indian sector indexed.
            </h2>
            <p className="mt-2 text-xs sm:text-sm font-mono text-muted-foreground">
              Filter by keyword or sector. Enter any National (₹500 min) or State (₹100 min) board.
            </p>
          </div>

          <div className="relative w-full sm:w-80 font-mono">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter 23 sectors…"
              className="pl-9 h-10 text-xs bg-black/70 border-cyan-500/30 text-foreground focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
            />
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((c, i) => (
            <div
              key={c.slug}
              className="group relative flex flex-col justify-between rounded-xl border border-cyan-500/20 bg-gradient-to-b from-black/80 to-cyan-950/20 p-5 backdrop-blur-md transition-all hover:border-cyan-400/80 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)]"
            >
              <div>
                <div className="flex items-center justify-between font-mono">
                  <span className="text-[10px] text-cyan-400/80 font-bold tracking-wider">
                    SECTOR #{i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </span>
                  <Badge variant="outline" className="text-[9px] font-mono border-cyan-500/30 text-cyan-300">
                    ACID VERIFIED
                  </Badge>
                </div>

                <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-cyan-300 transition-colors">
                  {c.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                  {c.description}
                </p>
              </div>

              <div className="mt-6 pt-3 border-t border-cyan-500/15 flex items-center justify-between font-mono">
                <div className="text-[11px] text-muted-foreground">
                  Floor: <span className="text-cyan-400 font-bold">₹100</span> (State) / <span className="text-cyan-400 font-bold">₹500</span> (Nat.)
                </div>
                <Button asChild size="sm" className="h-7 text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 transition-all shadow-sm">
                  <Link href={`/bid?scope=national&categorySlug=${c.slug}`}>
                    BID <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
