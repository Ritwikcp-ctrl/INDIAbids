"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAuth } from "@/auth/auth-provider";
import { usePaymentStatus } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatInr } from "@/components/ui/lib/money";
import { CheckCircle2, Clock, XCircle, ArrowRight, Copy, Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function SuccessPage() {
  const { paymentId } = useParams<{ paymentId: string }>();
  const { user } = useAuth();
  const [manageToken, setManageToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("manageToken");
    if (token) setManageToken(token);
  }, []);

  const { data: payment } = usePaymentStatus(paymentId || null);

  const status = payment?.status || "PENDING";
  const isConfirmed = status === "SUCCEEDED";
  const isFailed = status === "FAILED";
  const isPending = status === "PENDING" || status === "CREATED";

  function copyManageLink() {
    if (!manageToken) return;
    const url = `${window.location.origin}/manage/${manageToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Manage link copied to clipboard");
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 sm:p-6 font-sans text-foreground">
      <div className="max-w-md w-full rounded-xl card-surface p-6 sm:p-8 shadow-xl border border-border/80">
        <div className="text-center pb-5 border-b border-border/50">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-card border border-border">
            {isConfirmed && <CheckCircle2 className="h-6 w-6 text-emerald-400" />}
            {isPending && <Clock className="h-6 w-6 text-primary animate-spin" />}
            {isFailed && <XCircle className="h-6 w-6 text-destructive" />}
          </div>

          <h1 className="text-xl font-bold tracking-tight text-foreground">
            {isConfirmed && "Payment Confirmed"}
            {isPending && "Confirming Transaction…"}
            {isFailed && "Payment Unsuccessful"}
          </h1>

          <p className="text-xs text-muted-foreground mt-1">
            {isConfirmed && "Your bid has been committed and the live leaderboard has updated."}
            {isPending && "Awaiting confirmation from Razorpay webhook."}
            {isFailed && "The transaction could not be completed."}
          </p>
        </div>

        <div className="space-y-4 pt-4">
          {payment && (
            <div className="rounded-lg bg-card/60 border border-border/60 p-3 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment ID:</span>
                <span className="font-mono text-foreground">{(payment.id || payment.paymentId || "").slice(0, 16)}…</span>
              </div>
              {payment.amountPaise && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold text-foreground">
                    {formatInr(Number(payment.amountPaise) / 100)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Authenticated user flow */}
          {isConfirmed && user && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-center text-muted-foreground">
                This listing has been linked to your account ({user.email}).
              </p>
              <Button asChild className="w-full text-xs font-semibold">
                <Link href="/dashboard">
                  View in Dashboard <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          )}

          {/* Anonymous user flow with one-time manageToken */}
          {isConfirmed && !user && manageToken && (
            <div className="space-y-3 pt-2">
              <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Your One-Time Private Manage Key
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Save this key now. Because you didn&apos;t create an account, this private link is the <strong>only way</strong> to manage your listing or raise your bid later.
                </p>

                <div className="flex items-center gap-2">
                  <code className="flex-1 block p-2 bg-background border border-border rounded text-[11px] font-mono break-all text-foreground">
                    {manageToken}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyManageLink} className="h-9 px-3">
                    {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <Button asChild size="sm" className="w-full text-xs font-semibold">
                  <Link href={`/manage/${manageToken}`}>
                    Manage Listing Now →
                  </Link>
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Want to manage all listings in one place?{" "}
                <Link href="/register" className="text-primary underline">
                  Create an account
                </Link>
              </p>
            </div>
          )}

          {isPending && (
            <div className="py-4 text-center">
              <div className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="mt-2 text-xs text-muted-foreground">
                Listening for webhook confirmation…
              </p>
            </div>
          )}

          {isFailed && (
            <Button asChild className="w-full text-xs font-semibold">
              <Link href="/bid">Try Again</Link>
            </Button>
          )}

          <div className="pt-2 text-center">
            <Button asChild variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
              <Link href="/bid?scope=national">View National Board</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
