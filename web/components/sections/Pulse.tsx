"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/lib/utils";
import { Sparkles, ArrowRight, ShieldCheck, Flame, Zap, Radio, Crown, Award } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// SlotDigit — a single digit that slides between values with neon flare.
// ─────────────────────────────────────────────────────────────
function SlotDigit({ value, prevValue }: { value: string; prevValue?: string }) {
  const reduce = useReducedMotion();
  const prev = prevValue ?? value;
  const direction = value >= prev ? 1 : -1;

  if (reduce) return <span className="tabular-nums">{value}</span>;

  return (
    <span
      className="relative inline-block overflow-hidden align-top"
      style={{ height: "1em", width: "0.62em", lineHeight: 1 }}
      aria-hidden="true"
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: direction > 0 ? "100%" : "-100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction > 0 ? "-100%" : "100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 28 }}
          className="absolute inset-0 flex items-center justify-center leading-none tabular-nums"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Ticker({ value, prevValue }: { value: string; prevValue?: string }) {
  const chars = value.split("");
  const prevChars = (prevValue ?? value).split("");
  const offset = prevChars.length - chars.length;

  return (
    <>
      {chars.map((ch, i) => {
        const rawPrev = prevChars[i + offset];
        const prev = rawPrev && /\d/.test(rawPrev) ? rawPrev : ch;
        const isDigit = ch >= "0" && ch <= "9";

        return isDigit ? (
          <SlotDigit key={`${i}-${ch}`} value={ch} prevValue={prev} />
        ) : (
          <span key={`${i}-${ch}`} className="tabular-nums text-cyan-400">
            {ch}
          </span>
        );
      })}
    </>
  );
}

export function Pulse() {
  const [selectedFloor, setSelectedFloor] = useState<"national" | "state">("national");

  const minStake = selectedFloor === "national" ? 500 : 100;
  const prevStake = selectedFloor === "national" ? 100 : 500;

  const formatter = useMemo(
    () => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }),
    []
  );
  const formatted = useMemo(() => `₹${formatter.format(minStake)}`, [formatter, minStake]);
  const prevFormatted = useMemo(() => `₹${formatter.format(prevStake)}`, [formatter, prevStake]);

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 sm:px-6">
      {/* Intense Cyberpunk ambient background flares */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute left-1/3 top-1/4 h-[25rem] w-[25rem] rounded-full bg-fuchsia-600/12 blur-[100px]" />
        <div className="absolute right-1/4 bottom-1/4 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-[110px]" />
      </div>

      {/* Futuristic HUD Pill */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-2"
      >
        <div className="relative inline-flex items-center gap-2.5 rounded-full border border-cyan-500/40 bg-black/70 px-4 py-1.5 text-xs font-mono shadow-[0_0_20px_rgba(0,240,255,0.25)] backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-80" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          <span className="font-bold text-cyan-300 tracking-wider">LIVE HIGH-STAKES LEADERBOARDS</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <Crown className="h-3 w-3" /> RANK #1 OPEN
          </span>
        </div>
      </motion.div>

      {/* Cyber Mode Switcher (National ₹500 vs State ₹100) */}
      <div className="mt-8 flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-black/60 p-1 font-mono text-xs backdrop-blur-md">
        <button
          type="button"
          onClick={() => setSelectedFloor("national")}
          className={cn(
            "rounded-md px-3 py-1 font-bold transition-all",
            selectedFloor === "national"
              ? "bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,240,255,0.6)]"
              : "text-muted-foreground hover:text-cyan-300"
          )}
        >
          [ NATIONAL FLOOR · ₹500 ]
        </button>
        <button
          type="button"
          onClick={() => setSelectedFloor("state")}
          className={cn(
            "rounded-md px-3 py-1 font-bold transition-all",
            selectedFloor === "state"
              ? "bg-fuchsia-500 text-black shadow-[0_0_15px_rgba(255,0,122,0.6)]"
              : "text-muted-foreground hover:text-fuchsia-300"
          )}
        >
          [ STATE FLOOR · ₹100 ]
        </button>
      </div>

      {/* The Central Glowing Price Display */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mt-8 flex flex-col items-center text-center"
      >
        <div className="relative">
          {/* Tech frame accents */}
          <span className="absolute -top-4 -left-6 text-xs font-mono text-cyan-500/60 font-black">┌ HUD</span>
          <span className="absolute -top-4 -right-6 text-xs font-mono text-cyan-500/60 font-black">┐</span>
          <span className="absolute -bottom-4 -left-6 text-xs font-mono text-cyan-500/60 font-black">└</span>
          <span className="absolute -bottom-4 -right-6 text-xs font-mono text-cyan-500/60 font-black">┘ MIN_BID</span>

          <div
            className={cn(
              "flex items-baseline font-black leading-[0.85] tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 neon-text-cyan",
              "text-[clamp(4.2rem,13vw,9rem)]"
            )}
            aria-live="polite"
          >
            <Ticker value={formatted} prevValue={prevFormatted} />
          </div>
        </div>

        <p className="mt-6 max-w-xl text-balance text-sm sm:text-base font-medium text-muted-foreground leading-relaxed">
          The supreme paid leaderboard where Indian businesses, creators, and startups bid for ranking.
          No subscriptions. No gatekeepers. <span className="text-foreground font-semibold">Rank is what you pay.</span>
        </p>
      </motion.div>

      {/* Psychological Feature Badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl w-full text-xs font-mono"
      >
        <div className="flex items-center gap-2.5 rounded-lg border border-cyan-500/25 bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-cyan-500/15 text-cyan-400">
            <Zap className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Zero Account Needed</p>
            <p className="text-[11px] text-muted-foreground">Anonymous one-time manage key</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-fuchsia-500/25 bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-fuchsia-500/15 text-fuchsia-400">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Postgres ACID Truth</p>
            <p className="text-[11px] text-muted-foreground">Advisory lock money concurrency</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/25 bg-black/50 p-3 backdrop-blur-sm">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-amber-500/15 text-amber-400">
            <Crown className="h-4 w-4" />
          </div>
          <div>
            <p className="font-bold text-foreground">Cumulative Spend</p>
            <p className="text-[11px] text-muted-foreground">Raise anytime by paying the gap</p>
          </div>
        </div>
      </motion.div>

      {/* Cyberpunk Call to Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Link
          href={`/bid?scope=${selectedFloor}`}
          className={cn(
            buttonVariants({ size: "lg" }),
            "group min-w-52 h-12 bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-black font-mono font-black text-sm tracking-wider shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.7)] transition-all"
          )}
        >
          CLAIM RANK #{1} NOW
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
        <a
          href="#cyber-categories"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "min-w-52 h-12 border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-950/40 hover:text-white font-mono text-sm tracking-wide shadow-[0_0_15px_rgba(255,0,122,0.2)] hover:shadow-[0_0_30px_rgba(255,0,122,0.4)] transition-all"
          )}
        >
          [ EXPLORE 23 SECTORS ]
        </a>
      </motion.div>
    </section>
  );
}
