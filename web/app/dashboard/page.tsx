"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/auth/auth-provider";
import { useMyBusinesses } from "@/api/hooks";
import { api } from "@/api/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatInr } from "@/components/ui/lib/money";
import {
  Trophy,
  Plus,
  ExternalLink,
  Globe,
  MapPin,
  ArrowUpRight,
  LogOut,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const { data, isLoading, mutate } = useMyBusinesses();

  const [claimToken, setClaimToken] = useState("");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?next=/dashboard");
    }
  }, [loading, user, router]);

  async function handleClaimToken(e: React.FormEvent) {
    e.preventDefault();
    const token = claimToken.trim();
    if (!token) return toast.error("Enter a manage token");

    setClaiming(true);
    try {
      await api.post(`/manage/${token}/claim`);
      toast.success("Listing claimed to your account successfully!");
      setClaimToken("");
      mutate();
    } catch (err: any) {
      toast.error(err?.message || "Failed to claim listing. Check your token.");
    } finally {
      setClaiming(false);
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
        <p className="text-xs text-muted-foreground animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  if (!user) return null;

  const businesses = data?.businesses || [];

  return (
    <div className="min-h-screen bg-background text-foreground py-10 px-4 sm:px-6 font-sans">
      <div className="mx-auto max-w-5xl space-y-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">
                INDIA<span className="text-primary font-black">bids</span>
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Dashboard
              </Badge>
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
              Welcome, {user.name || user.email.split("@")[0]}
            </h1>
            <p className="text-xs text-muted-foreground">
              Account: {user.email}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button asChild size="sm" className="text-xs font-semibold shadow-sm">
              <Link href="/bid?scope=national">
                <Plus className="mr-1 h-3.5 w-3.5" /> Place New Bid
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => logout()} className="text-xs">
              <LogOut className="mr-1 h-3.5 w-3.5" /> Log Out
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Claim Existing Anonymous Listing Widget */}
        <div className="rounded-xl card-surface p-5 shadow-sm border border-border/80">
          <div className="pb-3">
            <h2 className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" /> Claim an Anonymous Listing
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Did you bid anonymously earlier? Paste your private manage token below to link that business to this account permanently.
            </p>
          </div>
          <div>
            <form onSubmit={handleClaimToken} className="flex gap-2">
              <Input
                value={claimToken}
                onChange={(e) => setClaimToken(e.target.value)}
                placeholder="Paste your manage token here…"
                className="h-9 text-xs flex-1 bg-background font-mono"
              />
              <Button type="submit" size="sm" disabled={claiming} className="text-xs h-9 font-semibold px-4">
                {claiming ? "Claiming…" : "Claim Listing"}
              </Button>
            </form>
          </div>
        </div>

        {/* My Businesses Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Your Businesses ({businesses.length})
            </h2>
          </div>

          {businesses.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-12 text-center text-muted-foreground space-y-3">
              <Trophy className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">No businesses linked to your account yet.</p>
              <Button asChild size="sm" className="text-xs font-semibold shadow-sm">
                <Link href="/bid?scope=national">Place Your First Bid →</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {businesses.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl card-surface p-5 shadow-sm border border-border/80 space-y-4"
                >
                  <div className="pb-3 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-foreground">{b.name}</h3>
                        <Badge variant="secondary" className="text-[10px]">
                          {b.category.name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Slug: /{b.slug} · Location: {b.state || "All-India"}
                      </p>
                    </div>

                    {b.website && (
                      <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                        <a href={b.website} target="_blank" rel="noopener noreferrer">
                          Visit Site <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Board Memberships & Spend
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {b.memberships.map((m) => {
                        const isNational = m.board.scope === "NATIONAL";
                        const spendInr = Number(m.totalSpendPaise) / 100;
                        const isRankOne = m.rank === 1;

                        return (
                          <div
                            key={m.id}
                            className="rounded-lg bg-card/60 border border-border/60 p-3 flex items-center justify-between"
                          >
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {isNational ? (
                                  <Globe className="h-3 w-3 text-primary" />
                                ) : (
                                  <MapPin className="h-3 w-3 text-primary" />
                                )}
                                <span className="text-foreground">{m.board.name}</span>
                              </div>
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                Cumulative Spend:{" "}
                                <strong className="text-foreground font-mono">
                                  {formatInr(spendInr)}
                                </strong>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className={`text-xs font-bold ${isRankOne ? "text-amber-400" : "text-foreground"}`}>
                                {m.rank ? `Rank #${m.rank}` : "Unranked"}
                              </span>
                              <Button asChild size="sm" variant="outline" className="h-7 text-[11px] font-medium">
                                <Link
                                  href={`/bid?scope=${
                                    isNational ? "national" : "state"
                                  }&state=${m.board.state || ""}&businessId=${b.id}`}
                                >
                                  Raise <ArrowUpRight className="ml-0.5 h-3 w-3" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
