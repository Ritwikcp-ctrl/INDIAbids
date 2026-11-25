"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, Trophy, Globe, MapPin, ExternalLink, ShieldCheck, Crown } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatInr } from "@/components/ui/lib/money";
import { useLeaderboard, useBoardByKey } from "@/api/hooks";
import { ALL_INDIAN_STATES } from "@/types/states";
import { REAL_CATEGORIES } from "@/types/categories";
import type { Scope } from "@/types/api";

interface LeaderboardProps {
  categorySlug: string;
  scope: Scope;
  state: string;
  onScopeChange: (scope: Scope) => void;
  onStateChange: (state: string) => void;
  onCategoryChange: (slug: string) => void;
}

export function LeaderboardView({
  categorySlug,
  scope,
  state,
  onScopeChange,
  onStateChange,
  onCategoryChange,
}: LeaderboardProps) {
  const [query, setQuery] = useState("");

  const boardKey = useMemo(() => {
    if (scope === "NATIONAL") {
      return `${categorySlug}-national`;
    }
    const safeState = (state || "delhi").toLowerCase().replace(/[^a-z0-9]+/g, "-");
    return `${categorySlug}-${safeState}`;
  }, [categorySlug, scope, state]);

  const { data: boardData, isLoading: isBoardLoading } = useBoardByKey(boardKey);
  const board = boardData?.board;

  const { data: lbData, isLoading: isLbLoading } = useLeaderboard(board?.id ?? null);
  const entries = lbData?.leaderboard ?? [];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (!e.business) return false;
      return (
        !query ||
        e.business.name.toLowerCase().includes(query.toLowerCase()) ||
        e.business.slug.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [entries, query]);

  const minBidInr = board ? Number(board.minBidPaise) / 100 : scope === "NATIONAL" ? 500 : 100;
  const currentLeader = entries.length > 0 ? entries[0] : null;

  return (
    <div className="space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          1. BOARD CONTROL FILTER BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Scope Toggle (National vs State) */}
          <div className="inline-flex rounded-lg bg-background p-1 border border-border/80">
            <button
              type="button"
              onClick={() => onScopeChange("NATIONAL")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                scope === "NATIONAL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              National Board
            </button>

            <button
              type="button"
              onClick={() => onScopeChange("STATE")}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                scope === "STATE"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              State Board
            </button>
          </div>

          {/* Quick Search inside Board */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings…"
              className="h-8 pl-8 text-xs bg-background"
            />
          </div>
        </div>

        {/* Dropdowns Row: Category & State (All 36 States/UTs in Dropdown Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/50">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
              Select Category
            </label>
            <Select value={categorySlug} onValueChange={onCategoryChange}>
              <SelectTrigger className="h-9 text-xs w-full bg-background">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {REAL_CATEGORIES.map((c) => (
                  <SelectItem key={c.slug} value={c.slug} className="text-xs">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {scope === "STATE" && (
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">
                Select Indian State / Union Territory (36 Available)
              </label>
              <Select value={state} onValueChange={onStateChange}>
                <SelectTrigger className="h-9 text-xs w-full bg-background font-medium">
                  <SelectValue placeholder="Select State / UT" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {ALL_INDIAN_STATES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. BOARD STATUS CARD
          ───────────────────────────────────────────────────────────── */}
      <div className="card-surface rounded-xl p-5 shadow-sm border border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] font-semibold">
                {scope === "NATIONAL" ? "All-India Scope" : `State Scope · ${state}`}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {board?.status || "ACTIVE"}
              </Badge>
            </div>
            <h1 className="text-xl font-bold text-foreground mt-1.5">
              {board?.name || "Loading Board…"}
            </h1>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px]">Minimum Bid</span>
              <span className="font-bold text-foreground text-sm">
                {formatInr(minBidInr)}
              </span>
            </div>
            <div className="border-l border-border pl-4">
              <span className="text-muted-foreground block text-[11px]">Active Listings</span>
              <span className="font-bold text-foreground text-sm">
                {entries.length}
              </span>
            </div>
          </div>
        </div>

        {/* Current Leader Bar */}
        {currentLeader ? (
          <div className="mt-4 rounded-lg bg-card/60 p-3 border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="text-muted-foreground">Current #1 Leader:</span>
              <strong className="text-foreground">{currentLeader.business?.name}</strong>
            </div>
            <span className="font-bold text-foreground">
              Total Spend: {formatInr(Number(currentLeader.totalSpend?.paise || 0) / 100)}
            </span>
          </div>
        ) : (
          <div className="mt-4 rounded-lg bg-card/40 p-3 border border-border/40 text-xs text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Rank #1 is currently open. Any qualifying bid will immediately claim first place.</span>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. LEADERBOARD RANKINGS TABLE
          ───────────────────────────────────────────────────────────── */}
      <div className="card-surface rounded-xl overflow-hidden shadow-sm border border-border/80">
        <div className="px-5 py-3.5 border-b border-border/50 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Official Spend Ladder
          </span>
          <span className="text-xs text-muted-foreground">
            Tiebreaker: Earliest timestamp
          </span>
        </div>

        {isBoardLoading || isLbLoading ? (
          <div className="py-16 text-center text-xs text-muted-foreground">
            <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent mb-2" />
            <p>Loading live rankings…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border">
              <Trophy className="h-5 w-5 text-muted-foreground" />
            </div>
            <h3 className="text-base font-bold text-foreground">No Listings Yet</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              No business has placed a bid on this board yet. Place the first bid of{" "}
              <strong className="text-foreground">{formatInr(minBidInr)}</strong> to secure Rank #1 immediately.
            </p>
            <Button
              size="sm"
              className="mt-2 text-xs font-semibold"
              onClick={() => {
                document.getElementById("bid-form")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Claim Rank #1 Now
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60 hover:bg-transparent">
                <TableHead className="w-16 text-xs font-semibold">Rank</TableHead>
                <TableHead className="text-xs font-semibold">Business / Brand</TableHead>
                <TableHead className="text-xs font-semibold">Verified Total Spend</TableHead>
                <TableHead className="w-24 text-right text-xs font-semibold">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => {
                const isRankOne = item.rank === 1;
                const isRankTwo = item.rank === 2;
                const isRankThree = item.rank === 3;
                const spendInr = item.totalSpend ? Number(item.totalSpend.paise) / 100 : 0;

                return (
                  <TableRow
                    key={item.business?.id}
                    className={`border-border/40 transition-colors ${
                      isRankOne ? "bg-amber-500/5 hover:bg-amber-500/10" : "hover:bg-muted/30"
                    }`}
                  >
                    {/* Rank Badge */}
                    <TableCell>
                      {isRankOne ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-xs border border-amber-500/40">
                          #1
                        </span>
                      ) : isRankTwo ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-300/15 text-slate-200 font-bold text-xs border border-slate-300/30">
                          #2
                        </span>
                      ) : isRankThree ? (
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700/15 text-amber-300 font-bold text-xs border border-amber-700/30">
                          #3
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground ml-1">
                          #{item.rank}
                        </span>
                      )}
                    </TableCell>

                    {/* Business Name & Link */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground text-sm">
                          {item.business?.name}
                        </span>
                        {item.business?.website && (
                          <a
                            href={item.business.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                        {isRankOne && (
                          <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/40">
                            Leader
                          </Badge>
                        )}
                      </div>
                      {item.business?.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 max-w-md">
                          {item.business.description}
                        </p>
                      )}
                    </TableCell>

                    {/* Verified Total Spend */}
                    <TableCell className="font-semibold text-sm text-foreground tabular-nums">
                      {formatInr(spendInr)}
                    </TableCell>

                    {/* Action Button */}
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs px-2.5 font-medium"
                        onClick={() => {
                          document.dispatchEvent(
                            new CustomEvent("indiabids:prefill-bid", {
                              detail: {
                                businessId: item.business?.id,
                                name: item.business?.name,
                                slug: item.business?.slug,
                                suggestedAmount: spendInr + 100,
                              },
                            })
                          );
                        }}
                      >
                        Outbid <ArrowUpRight className="ml-1 h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
