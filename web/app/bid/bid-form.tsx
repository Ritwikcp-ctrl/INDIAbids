"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatInr } from "@/components/ui/lib/money";
import { api } from "@/api/client";
import { loadRazorpay } from "@/api/razorpay";
import { useAuth } from "@/auth/auth-provider";
import { ShieldCheck, UserCheck, ArrowRight, Lock } from "lucide-react";
import type { Scope } from "@/types/api";
import { REAL_CATEGORIES } from "@/types/categories";

interface BidFormProps {
  scope: Scope;
  state: string;
  categorySlug: string;
  onCategoryChange: (slug: string) => void;
}

interface BidCreateResponse {
  keyId?: string;
  amountPaise: string | number;
  orderId: string;
  paymentId: string;
  businessId: string;
  manageToken?: string;
}

export function BidForm({
  scope,
  state,
  categorySlug,
}: BidFormProps) {
  const router = useRouter();
  const { user } = useAuth();

  const currentCategory =
    REAL_CATEGORIES.find((c) => c.slug === categorySlug) || REAL_CATEGORIES[0];

  // Form state
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [emailOverride, setEmailOverride] = useState<string | null>(null);
  const contactEmail = emailOverride ?? user?.email ?? "";
  const [contactPhone] = useState("");

  // Existing listing target if outbidding
  const [targetBusinessId, setTargetBusinessId] = useState<string | null>(null);

  // Amount in INR
  const minBidInr = scope === "NATIONAL" ? 500 : 100;
  const [amount, setAmount] = useState(minBidInr);
  const effectiveAmount = Math.max(amount, minBidInr);
  const [busy, setBusy] = useState(false);

  // Listen to prefill events from leaderboard
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (
        e as CustomEvent<{
          businessId?: string;
          name?: string;
          slug?: string;
          suggestedAmount?: number;
        }>
      ).detail;

      if (detail.name) setName(detail.name);
      if (detail.businessId) setTargetBusinessId(detail.businessId);
      if (detail.suggestedAmount) {
        setAmount(Math.max(detail.suggestedAmount, minBidInr));
      }

      document
        .getElementById("bid-form")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    document.addEventListener("indiabids:prefill-bid", handler);
    return () => document.removeEventListener("indiabids:prefill-bid", handler);
  }, [minBidInr]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName && !targetBusinessId) {
      return toast.error("Please enter a business name");
    }

    if (!contactEmail.trim()) {
      return toast.error("Receipt email is required");
    }

    if (effectiveAmount < minBidInr) {
      return toast.error(`Minimum bid for this board is ${formatInr(minBidInr)}`);
    }

    setBusy(true);

    try {
      const amountPaise = String(Math.round(effectiveAmount * 100));

      const res = await api.post<BidCreateResponse>("/bids", {
        name: trimmedName,
        website: website.trim() || undefined,
        description: description.trim() || undefined,
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim() || undefined,
        categorySlug,
        scope,
        state: scope === "STATE" ? state : undefined,
        businessId: targetBusinessId || undefined,
        amountPaise,
      });

      // Anonymous users receive one-time manageToken
      if (res.manageToken) {
        sessionStorage.setItem("manageToken", res.manageToken);
      }

      const razorpayKey =
        res.keyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TVWGKXZsXZhrbd";

      // Load Razorpay Checkout modal
      try {
        await loadRazorpay();
        const rzp = new window.Razorpay({
          key: razorpayKey,
          amount: Number(res.amountPaise),
          currency: "INR",
          name: "INDIAbids",
          description: `${scope === "NATIONAL" ? "National" : `State · ${state}`} Board Rank Bid`,
          order_id: res.orderId,
          prefill: {
            name: trimmedName,
            email: contactEmail,
            contact: contactPhone,
          },
          notes: {
            paymentId: res.paymentId,
            businessId: res.businessId,
          },
          handler: async (response) => {
            try {
              await api.post("/payments/verify", {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
            } catch {
              // Webhook reconciliation handles fallback if verify call times out
            } finally {
              router.push(`/success/${res.paymentId}`);
            }
          },
          modal: {
            ondismiss: () => {
              setBusy(false);
              router.push(`/success/${res.paymentId}`);
            },
          },
        });
        rzp.open();
      } catch {
        toast.info("Navigating to payment confirmation…");
        router.push(`/success/${res.paymentId}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Bid placement failed. Please try again.";
      toast.error(message);
      setBusy(false);
    }
  }

  return (
    <div
      id="bid-form"
      className="card-surface rounded-xl p-5 sm:p-6 shadow-md border border-border/80"
    >
      <div className="pb-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-foreground">
            {targetBusinessId ? "Raise Listing Bid" : "Place Your Bid"}
          </h2>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
            {scope === "NATIONAL" ? "National" : state}
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {user ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <UserCheck className="h-3.5 w-3.5" /> Bidding as {user.email}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Auth optional · You receive a secure manage link
            </span>
          )}
        </p>
      </div>

      <div className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Board Summary */}
          <div className="rounded-lg bg-card/60 p-3 border border-border/60 text-xs flex justify-between items-center">
            <span className="text-muted-foreground">Target Board:</span>
            <span className="font-semibold text-foreground">
              {currentCategory.name} · {scope === "NATIONAL" ? "National" : state}
            </span>
          </div>

          {/* Business Name */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Business or Brand Name
            </Label>
            <Input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Technologies"
              className="h-9 text-xs bg-background"
            />
          </div>

          {/* Website URL */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Website or Profile Link
            </Label>
            <Input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourbrand.in"
              className="h-9 text-xs bg-background"
            />
          </div>

          {/* Short Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">
              Tagline / Short Description (Optional)
            </Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. India's fastest B2B logistics network"
              className="h-9 text-xs bg-background"
            />
          </div>

          {/* Receipt Email */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold text-foreground">Receipt Email</Label>
            <Input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setEmailOverride(e.target.value)}
              placeholder="receipt@yourbrand.in"
              className="h-9 text-xs bg-background"
            />
          </div>

          {/* Bid Amount & Quick Bump Chips */}
          <div className="space-y-2 pt-3 border-t border-border/50">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-foreground">Your Bid Amount</Label>
              <span className="font-bold text-base text-foreground tabular-nums">
                {formatInr(effectiveAmount)}
              </span>
            </div>

            <Slider
              min={minBidInr}
              max={minBidInr * 25}
              step={50}
              value={[effectiveAmount]}
              onValueChange={([val]) => setAmount(val)}
              className="py-1.5"
            />

            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {[+100, +500, +1000, +5000].map((bump) => (
                <button
                  key={bump}
                  type="button"
                  className="rounded border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground text-[11px] h-7 font-semibold transition-all"
                  onClick={() => setAmount((curr) => Math.max(curr, minBidInr) + bump)}
                >
                  +{bump}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <Button
            type="submit"
            className="w-full mt-3 h-10 text-xs font-semibold shadow-sm"
            disabled={busy}
          >
            {busy ? (
              "Initializing payment gateway…"
            ) : (
              <>
                Confirm &amp; Pay {formatInr(effectiveAmount)}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </>
            )}
          </Button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <Lock className="h-3 w-3 text-emerald-400" />
            <span>Fulfilled instantly via Razorpay · Bids never expire</span>
          </div>
        </form>
      </div>
    </div>
  );
}
