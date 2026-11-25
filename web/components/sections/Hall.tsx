"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { REAL_CATEGORIES } from "@/types/categories";
import { ArrowUpRight, Radio, Crown } from "lucide-react";

export function Hall() {
  const featured = REAL_CATEGORIES.slice(0, 8);

  return (
    <section
      id="hall"
      className="scroll-mt-8 border-t border-cyan-500/20 px-4 py-20 sm:px-6 relative"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-cyan-400">
                SECTOR MATRIX // HOTTEST LEADERBOARDS
              </p>
            </div>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl text-foreground">
              Seize #1 in your domain.
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm font-mono text-muted-foreground">
            Two distinct battlegrounds per sector: National (₹500 min) & State (₹100 min).
            Rank updates in sub-millisecond O(log N) Redis read time.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="group relative flex flex-col justify-between rounded-xl border border-cyan-500/25 bg-gradient-to-b from-black/80 to-cyan-950/20 p-5 backdrop-blur-md transition-all hover:border-cyan-400 hover:shadow-[0_0_30px_rgba(0,240,255,0.22)]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge className="text-[10px] font-mono tracking-wider bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                    SECTOR #{i + 1 < 10 ? `0${i + 1}` : i + 1}
                  </Badge>
                  <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                    <Crown className="h-3 w-3" /> #1 AVAILABLE
                  </span>
                </div>

                <h3 className="mt-3.5 font-bold text-foreground text-base group-hover:text-cyan-300 transition-colors">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-cyan-500/15 pt-3 font-mono">
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground uppercase">National Floor</span>
                  <span className="text-xs font-bold text-cyan-400">₹500</span>
                </div>
                <Button asChild size="sm" className="h-8 text-xs font-mono font-bold bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 transition-all shadow-sm">
                  <Link href={`/bid?scope=national&categorySlug=${cat.slug}`}>
                    CLAIM <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
