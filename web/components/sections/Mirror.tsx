"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/lib/utils";
import { formatInr } from "@/components/ui/lib/money";
import { REAL_CATEGORIES } from "@/types/categories";
import { ArrowRight, Trophy, Crown, Crosshair, Sparkles } from "lucide-react";

export function Mirror() {
  const [url, setUrl] = useState("");
  const [categorySlug, setCategorySlug] = useState(REAL_CATEGORIES[0].slug);
  const [scope, setScope] = useState<"NATIONAL" | "STATE">("NATIONAL");
  const [preview, setPreview] = useState<null | {
    categoryName: string;
    scope: "NATIONAL" | "STATE";
    minBid: number;
    url: string;
  }>(null);

  const selectedCategory =
    REAL_CATEGORIES.find((c) => c.slug === categorySlug) || REAL_CATEGORIES[0];

  function handlePreview(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setPreview({
      categoryName: selectedCategory.name,
      scope,
      minBid: scope === "NATIONAL" ? 500 : 100,
      url: url.trim(),
    });
  }

  return (
    <section id="mirror" className="scroll-mt-8 border-t border-cyan-500/20 px-4 py-20 sm:px-6 relative">
      <div className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-950/20 px-3.5 py-1 text-xs font-mono text-fuchsia-400">
          <Crosshair className="h-3.5 w-3.5 text-fuchsia-400 animate-spin" style={{ animationDuration: "12s" }} />
          TARGETING RADAR // RANK SIMULATOR
        </div>

        <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-foreground">
          Simulate your rank projection.
        </h2>
        <p className="mt-2 text-xs sm:text-sm font-mono text-muted-foreground">
          Feed your website or brand URL into the algorithm. Calculate the exact stake required to claim rank #1.
        </p>

        {/* HUD Frame Form */}
        <form onSubmit={handlePreview} className="mt-8 rounded-xl border border-cyan-500/30 bg-black/70 p-6 backdrop-blur-md shadow-[0_0_30px_rgba(0,240,255,0.12)] text-left font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1.5 uppercase tracking-wider">
                [ 01 // Sector Target ]
              </label>
              <Select value={categorySlug} onValueChange={setCategorySlug}>
                <SelectTrigger className="h-10 text-xs w-full bg-cyan-950/20 border-cyan-500/30 text-foreground focus:border-cyan-400">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-black/95 border-cyan-500/40 text-foreground">
                  {REAL_CATEGORIES.map((c) => (
                    <SelectItem key={c.slug} value={c.slug} className="text-xs font-mono focus:bg-cyan-950/60 focus:text-cyan-300">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-bold text-cyan-300 block mb-1.5 uppercase tracking-wider">
                [ 02 // Battleground Scope ]
              </label>
              <Select
                value={scope}
                onValueChange={(v) => setScope(v as "NATIONAL" | "STATE")}
              >
                <SelectTrigger className="h-10 text-xs w-full bg-cyan-950/20 border-cyan-500/30 text-foreground focus:border-cyan-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black/95 border-cyan-500/40 text-foreground">
                  <SelectItem value="NATIONAL" className="text-xs font-mono">
                    NATIONAL BOARD (₹500 MIN)
                  </SelectItem>
                  <SelectItem value="STATE" className="text-xs font-mono">
                    STATE BOARD (₹100 MIN)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://yourbrand.in or @handle"
              className="h-11 text-xs bg-cyan-950/15 border-cyan-500/30 text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-400"
              required
            />
            <button
              type="submit"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-11 shrink-0 font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              )}
            >
              RUN SIMULATION →
            </button>
          </div>
        </form>
      </div>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="mx-auto mt-8 max-w-2xl font-mono"
          >
            <div className="relative overflow-hidden rounded-xl border border-cyan-400 bg-gradient-to-b from-cyan-950/40 via-black to-black p-6 shadow-[0_0_35px_rgba(0,240,255,0.25)] backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/60 text-amber-300 font-black text-xl shadow-[0_0_20px_rgba(255,184,0,0.4)]">
                    #1
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm sm:text-base tracking-tight">{preview.url}</p>
                    <p className="text-xs text-cyan-400">
                      {preview.categoryName} · {preview.scope} BOARD
                    </p>
                  </div>
                </div>
                <Badge className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/50">
                  <Crown className="mr-1 h-3 w-3" /> TARGET RANK: #1
                </Badge>
              </div>

              <div className="mt-5 rounded-lg border border-cyan-500/20 bg-black/60 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Required Entry Bid:</span>
                  <span className="font-bold text-cyan-400 text-base">
                    {formatInr(preview.minBid)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                  PostgreSQL ACID lock guarantees your rank is written atomically upon payment.
                  Anonymous users receive a cryptographically hashed one-time token to manage or raise bids later.
                </p>
              </div>

              <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Instant Razorpay checkout · No account needed
                </span>
                <Link
                  href={`/bid?scope=${preview.scope.toLowerCase()}&categorySlug=${categorySlug}&url=${encodeURIComponent(
                    preview.url
                  )}`}
                  className={cn(
                    buttonVariants(),
                    "w-full sm:w-auto font-bold bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_25px_rgba(255,184,0,0.5)] hover:shadow-[0_0_35px_rgba(255,184,0,0.7)]"
                  )}
                >
                  CLAIM RANK #{1} FOR {formatInr(preview.minBid)}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
