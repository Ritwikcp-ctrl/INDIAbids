"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Scale, ShieldAlert } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const RULES = [
  {
    number: "01",
    title: "Ranking by Lifetime Cumulative Spend",
    body: "Every leaderboard orders businesses strictly from highest to lowest verified cumulative INR spend on that board. There are no editorial boosts, relevance penalties, or ad quality multipliers.",
  },
  {
    number: "02",
    title: "Tie-Breaker Priority",
    body: "If two businesses hold the exact same cumulative spend on a board, the listing that reached that amount earlier holds the higher rank.",
  },
  {
    number: "03",
    title: "Independent National & State Ledgers",
    body: "Each of the 23 categories maintains an All-India National Board (₹500 minimum bid) and separate State/UT Boards (₹100 minimum bid). Spend on one board does not transfer to another.",
  },
  {
    number: "04",
    title: "Cumulative Top-Ups (Never Overwritten)",
    body: "Your verified spend compounds permanently. If a competitor bids higher than you, you only need to pay the difference plus ₹1 or more to overtake them and reclaim Rank #1.",
  },
  {
    number: "05",
    title: "Manage Keys & Account Claiming",
    body: "Bidding without an account issues a one-time cryptographic manage link. Keep it private—anyone holding a valid unclaimed manage token can raise the listing or claim it to an account.",
  },
  {
    number: "06",
    title: "Listing Standards & Acceptable Content",
    body: "Listings must represent real businesses, products, creators, or projects using accurate names, descriptions, and safe HTTPS destinations. Illegal, fraudulent, phishing, or deceptive listings may be removed without refund.",
  },
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-card/30 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl space-y-4">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
            >
              Official Protocol
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Leaderboard &amp; Bidding Rules
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              Clear, deterministic rules govern every National and State board on INDIAbids so every rupee you spend behaves predictably.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {RULES.map((rule) => (
              <div key={rule.number} className="card-surface rounded-2xl p-6 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF4D1F]/10 text-xs font-bold text-[#FF4D1F]">
                    {rule.number}
                  </span>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500/80" />
                </div>
                <h2 className="text-base font-bold text-foreground">{rule.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{rule.body}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#FF4D1F]/10 text-[#FF4D1F]">
                <Scale className="h-4 w-4" />
              </span>
              <div className="space-y-1">
                <p className="text-sm font-bold text-foreground">
                  Moderation &amp; Compliance Notice
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Questions about a listing or takedown request? Reach out via{" "}
                  <a href="mailto:hello@indiabids.in" className="text-[#FF4D1F] underline">
                    hello@indiabids.in
                  </a>{" "}
                  or review our{" "}
                  <Link href="/terms" className="text-foreground underline">
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            </div>

            <Button
              asChild
              size="sm"
              className="shrink-0 rounded-full bg-[#FF4D1F] px-5 text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317]"
            >
              <Link href="/bid?scope=national">
                Go to Boards <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
            <ShieldAlert className="h-4 w-4 text-[#FF4D1F]" />
            <span>
              Payments are settled in INR via Razorpay and reflected only after webhook/signature verification.
            </span>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
