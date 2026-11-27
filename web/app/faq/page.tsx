"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import FaqAccordion from "@/components/ui/faq-accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const FAQ_ITEMS = [
  {
    question: "How does the ranking system work?",
    answer:
      "Rank is determined strictly by lifetime cumulative verified spend on each board. The business with the highest total holds Rank #1. If two bids are equal, the earlier verified transaction holds priority.",
  },
  {
    question: "What is the difference between National and State boards?",
    answer:
      "Each of the 23 categories has an All-India National Board (₹500 minimum bid) and independent State Boards (₹100 minimum bid) across 36 Indian states and union territories. Each board maintains its own spend ladder.",
  },
  {
    question: "Do bids expire or require monthly subscriptions?",
    answer:
      "No. There are zero recurring subscriptions or expiration timers. Your cumulative spend remains on the leaderboard permanently, and you keep your rank until a competitor accumulates more spend.",
  },
  {
    question: "Can I bid without creating an account?",
    answer:
      "Yes. Authentication is optional. When you bid without signing in, you receive a one-time cryptographic manage link to raise your bid later—or claim the listing to a registered account anytime.",
  },
  {
    question: "How do I raise my bid if someone outbids me?",
    answer:
      "Open your listing from your Dashboard or private manage link and pay only the additional amount you want to add. Money is never overwritten—your new payment adds directly to your cumulative total.",
  },
  {
    question: "How are payments processed and confirmed?",
    answer:
      "Payments are processed in INR via Razorpay (UPI, cards, and NetBanking). Once confirmed by Razorpay, PostgreSQL records the payment and updates the Redis leaderboard immediately.",
  },
  {
    question: "Can one business appear in multiple boards?",
    answer:
      "Yes. A business can compete on both a National Board and one or more State Boards, with each board tracking its own independent cumulative spend.",
  },
];

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-card/30 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-4xl text-center space-y-4">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
            >
              Frequently Asked Questions
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Clear Answers on Ranking &amp; Money
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Everything you need to know about cumulative bidding, National vs. State boards, Razorpay checkout, and anonymous manage links.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 space-y-10">
          <FaqAccordion title="" className="py-0" items={FAQ_ITEMS} />

          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-bold text-foreground">Still have questions?</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Read the full{" "}
                <Link href="/rules" className="text-[#FF4D1F] underline">
                  Bidding Rules
                </Link>{" "}
                or inspect live leaderboards right now.
              </p>
            </div>
            <Button
              asChild
              size="sm"
              className="rounded-full bg-[#FF4D1F] px-5 text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317]"
            >
              <Link href="/bid?scope=national">
                Explore Boards <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
