"use client";

import { useMemo } from "react";
import { formatInr } from "@/components/ui/lib/money";
import { Trophy, TrendingUp, Crown, Zap } from "lucide-react";

interface BidChartProps {
  entries?: Array<{
    rank: number;
    business?: { name: string } | null;
    totalSpend?: { paise: string } | null;
  }>;
  minBidPaise?: string;
}

export function BidChart({ entries = [], minBidPaise = "50000" }: BidChartProps) {
  const topList = useMemo(() => {
    return entries.slice(0, 5).map((e) => ({
      rank: e.rank,
      name: e.business?.name || "Anonymous",
      amountInr: e.totalSpend ? Number(e.totalSpend.paise) / 100 : 0,
    }));
  }, [entries]);

  const maxAmount = useMemo(() => {
    const highest = Math.max(...topList.map((t) => t.amountInr), 1000);
    return highest * 1.15;
  }, [topList]);

  return (
    <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-b from-black/80 to-cyan-950/20 p-6 backdrop-blur-md shadow-[0_0_25px_rgba(0,240,255,0.1)] font-mono">
      <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" />
          <h3 className="font-bold text-sm tracking-wider uppercase text-foreground">
            LADDER TELEMETRY // SPEND SPECTRUM
          </h3>
        </div>
        <span className="text-[11px] text-cyan-400 flex items-center gap-1 font-semibold">
          <Zap className="h-3.5 w-3.5" /> LIVE O(log N) METRIC
        </span>
      </div>

      <div className="mt-6 space-y-4">
        {topList.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground border border-dashed border-cyan-500/20 rounded-lg">
            No bids recorded on this board yet. Be the first to claim Rank #1 for {formatInr(Number(minBidPaise) / 100)}!
          </div>
        ) : (
          topList.map((item) => {
            const pct = Math.min(100, Math.max(8, (item.amountInr / maxAmount) * 100));
            const isFirst = item.rank === 1;

            return (
              <div key={item.rank} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold flex items-center gap-2">
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-black ${
                        isFirst
                          ? "bg-amber-500 text-black shadow-[0_0_12px_rgba(255,184,0,0.6)]"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-500/30"
                      }`}
                    >
                      #{item.rank}
                    </span>
                    <span className={isFirst ? "text-amber-300 font-bold" : "text-foreground"}>
                      {item.name}
                    </span>
                  </span>
                  <span className="font-mono text-cyan-400 tabular-nums font-bold">
                    {formatInr(item.amountInr)}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-black/60 border border-cyan-500/20 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isFirst
                        ? "bg-gradient-to-r from-amber-400 to-amber-500 shadow-[0_0_15px_rgba(255,184,0,0.6)]"
                        : "bg-gradient-to-r from-cyan-400 to-teal-400"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
