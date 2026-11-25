"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/components/ui/lib/utils";
import { ArrowRight, Flame, Sparkles, ShieldCheck } from "lucide-react";

export function Whisper() {
  return (
    <section className="px-4 pb-20 pt-16 sm:px-6 relative overflow-hidden">
      {/* Background neon ambient */}
      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
        <div className="h-64 w-[36rem] rounded-full bg-cyan-500/10 blur-[130px]" />
      </div>

      <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 pt-8 text-center font-mono">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-500/40 bg-fuchsia-950/20 px-4 py-1.5 text-xs text-fuchsia-300 shadow-[0_0_20px_rgba(255,0,122,0.2)]">
          <Flame className="h-3.5 w-3.5 text-fuchsia-400 animate-pulse" />
          <span>ZERO RECURRING FEES · PERMANENT VALUE COMPACTION</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-foreground">
          The board doesn&apos;t sleep.
        </h2>
        <p className="max-w-lg text-sm text-muted-foreground leading-relaxed">
          Rank is what you pay. Relevance is where you compete. Claim your rank starting from ₹100 on State boards and ₹500 on National boards.
        </p>

        <Link
          href="/bid?scope=national"
          className={cn(
            buttonVariants({ size: "lg" }),
            "group h-12 px-8 font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-fuchsia-500 hover:from-cyan-300 hover:to-fuchsia-400 text-black shadow-[0_0_35px_rgba(0,240,255,0.5)] hover:shadow-[0_0_50px_rgba(0,240,255,0.8)] transition-all mt-3"
          )}
        >
          CLAIM YOUR SPOT IN THE ARENA
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>

        <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-muted-foreground/70 pt-6">
          <span>PostgreSQL ACID Transactions</span>
          <span>·</span>
          <span>Redis O(log N) Leaderboard Engine</span>
          <span>·</span>
          <span>Instant Razorpay Webhook Fulfillment</span>
        </div>
      </div>
    </section>
  );
}
