"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/auth/auth-provider";
import { useManagedBusiness } from "@/api/hooks";
import { api } from "@/api/client";
import { loadRazorpay } from "@/api/razorpay";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { formatInr } from "@/components/ui/lib/money";
import {
  Trophy,
  ShieldAlert,
  ArrowUpRight,
  ExternalLink,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";

interface RaiseBidResponse {
  keyId: string;
  amountPaise: string | number;
  orderId: string;
  paymentId: string;
  businessId: string;
}

export default function ManageListingPage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const { user } = useAuth();

  const { data, error, isLoading, mutate } = useManagedBusiness(token || null);
  const business = data?.business;

  const [claiming, setClaiming] = useState(false);

  // Raise bid state
  const [raisingBoardId, setRaisingBoardId] = useState<string | null>(null);
  const [raiseAmount, setRaiseAmount] = useState(500);
  const [submittingBid, setSubmittingBid] = useState(false);

  async function handleClaim() {
    if (!user) {
      router.push(`/login?next=/manage/${token}`);
      return;
    }

    setClaiming(true);
    try {
      await api.post(`/manage/${token}/claim`);
      toast.success("Listing claimed to your account successfully!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to claim listing.";
      toast.error(message);
      setClaiming(false);
    }
  }

  async function handleRaiseBid(boardId: string) {
    setSubmittingBid(true);
    try {
      const res = await api.post<RaiseBidResponse>("/bids", {
        boardId,
        manageToken: token,
        amountPaise: String(raiseAmount * 100),
      });

      await loadRazorpay();
      const rzp = new window.Razorpay({
        key: res.keyId,
        amount: Number(res.amountPaise),
        currency: "INR",
        name: "INDIAbids",
        description: `Raise bid for ${business?.name}`,
        order_id: res.orderId,
        notes: { paymentId: res.paymentId, businessId: res.businessId },
        handler: async (response) => {
          try {
            await api.post("/payments/verify", {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success("Bid verified and leaderboard updated!");
          } catch {
            toast.info("Payment received; awaiting confirmation.");
          } finally {
            setSubmittingBid(false);
            mutate();
            setRaisingBoardId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setSubmittingBid(false);
            mutate();
          },
        },
      });
      rzp.open();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to raise bid.";
      toast.error(message);
      setSubmittingBid(false);
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans">
        <p className="text-xs text-muted-foreground animate-pulse">Loading listing…</p>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 font-sans text-foreground">
        <div className="max-w-md w-full text-center p-8 rounded-xl card-surface shadow-xl border border-border/80">
          <ShieldAlert className="mx-auto h-10 w-10 text-muted-foreground/60 mb-4" />
          <h2 className="text-lg font-bold">Listing Unavailable</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            This private token is invalid, expired, or has already been claimed by a registered account.
          </p>
          <div className="mt-6 flex flex-col gap-2">
            {user ? (
              <Button asChild size="sm" className="text-xs font-semibold">
                <Link href="/dashboard">Go to Your Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm" className="text-xs font-semibold">
                <Link href="/login">Login to Dashboard</Link>
              </Button>
            )}
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar user={user} />
      <div className="mx-auto w-full max-w-4xl space-y-6 py-8 px-4 sm:px-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
          <div>
            <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wider mb-1">
              Private Listing Management
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {business.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {business.category.name} · {business.state || "All-India"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {business.website && (
              <Button asChild size="sm" variant="outline" className="text-xs">
                <a href={business.website} target="_blank" rel="noopener noreferrer">
                  Visit Site <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </Button>
            )}
            <Button asChild size="sm" className="text-xs font-semibold">
              <Link href="/bid?scope=national">Place New Bid</Link>
            </Button>
          </div>
        </div>

        {/* Claim Listing Box */}
        <div className="rounded-xl card-surface p-5 border border-primary/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="font-semibold text-sm text-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" /> Claim to Account
            </h3>
            <p className="text-xs text-muted-foreground max-w-lg leading-relaxed">
              Transfer this listing to a registered account permanently so you can manage it from your dashboard without saving private tokens.
            </p>
          </div>

          <Button
            onClick={handleClaim}
            disabled={claiming}
            size="sm"
            className="font-semibold text-xs shrink-0 shadow-sm"
          >
            {user ? (claiming ? "Claiming…" : "Claim to My Account") : "Sign In & Claim"}
          </Button>
        </div>

        {/* Active Board Memberships */}
        <div className="space-y-4">
          <h2 className="text-base font-bold tracking-tight flex items-center gap-2 text-foreground">
            <Trophy className="h-4 w-4 text-primary" /> Active Board Memberships
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {business.memberships.map((m) => {
              const isNational = m.board.scope === "NATIONAL";
              const spendInr = Number(m.totalSpendPaise) / 100;
              const isRaising = raisingBoardId === m.board.id;
              const isRankOne = m.rank === 1;

              return (
                <div
                  key={m.id}
                  className="rounded-xl card-surface p-5 flex flex-col justify-between shadow-sm border border-border/80"
                >
                  <div className="pb-3 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-[10px]">
                        {isNational ? (
                          <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3 text-primary" /> National
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-primary" /> {m.board.state}
                          </span>
                        )}
                      </Badge>
                      <span className={`text-xs font-bold ${isRankOne ? "text-amber-400" : "text-foreground"}`}>
                        {m.rank ? `Rank #${m.rank}` : "Unranked"}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-foreground mt-2">{m.board.name}</h3>
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Total Verified Spend:</span>
                      <span className="font-bold text-foreground">
                        {formatInr(spendInr)}
                      </span>
                    </div>

                    {!isRaising ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full text-xs font-medium"
                        onClick={() => {
                          setRaisingBoardId(m.board.id);
                          setRaiseAmount(isNational ? 500 : 200);
                        }}
                      >
                        Raise Bid on this Board <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    ) : (
                      <div className="space-y-3 pt-2 border-t border-border/50">
                        <div className="flex items-center justify-between text-xs">
                          <Label className="text-xs">Raise by amount:</Label>
                          <span className="font-bold text-foreground">
                            {formatInr(raiseAmount)}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5">
                          {[+100, +250, +500, +1000].map((b) => (
                            <button
                              key={b}
                              type="button"
                              className="rounded border border-border/80 bg-background hover:bg-muted text-[11px] h-7 font-medium transition-all"
                              onClick={() => setRaiseAmount((curr) => curr + b)}
                            >
                              +{b}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="flex-1 text-xs font-semibold"
                            disabled={submittingBid}
                            onClick={() => handleRaiseBid(m.board.id)}
                          >
                            {submittingBid ? "Opening…" : `Pay ${formatInr(raiseAmount)}`}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-xs text-muted-foreground"
                            onClick={() => setRaisingBoardId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
