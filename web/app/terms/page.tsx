"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";

const SECTIONS = [
  {
    title: "1. Platform Purpose",
    body: "INDIAbids operates a paid leaderboard platform where businesses, creators, startups, and local merchants bid for ranked placement within 23 industry categories across National and State/UT boards.",
  },
  {
    title: "2. Bidding Mechanics & Finality",
    body: "All verified bids are cumulative and non-recurring. Minimum entry bids are ₹500 for National Boards and ₹100 for State Boards. Once a payment is captured and verified via Razorpay, the corresponding spend is permanently credited to your business membership on that board.",
  },
  {
    title: "3. Refunds & Cancellations",
    body: "Because rank placement and leaderboard exposure take effect immediately upon payment verification, captured bids are generally non-refundable. Duplicate technical charges or verified payment errors may be reviewed by contacting hello@indiabids.in within 7 days.",
  },
  {
    title: "4. Content & Listing Responsibility",
    body: "You represent that you have authority to submit the business name, website URL, and description provided, and that your listing does not promote unlawful goods, scams, impersonation, malware, or prohibited content. INDIAbids reserves the right to hide or remove non-compliant listings.",
  },
  {
    title: "5. Manage Links & Account Security",
    body: "Anonymous bidders are issued a private manage token. You are responsible for safeguarding that link and your account credentials. INDIAbids is not liable for unauthorized edits resulting from leaked manage links.",
  },
  {
    title: "6. Limitation of Liability & Governing Law",
    body: "INDIAbids provides leaderboard placement on an 'as-is' basis without guarantees of specific traffic, leads, or revenue. These terms are governed by the laws of India.",
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-border/70 bg-card/30 px-4 py-14 sm:px-6 sm:py-16">
          <div className="mx-auto max-w-3xl space-y-3">
            <Badge
              variant="outline"
              className="text-[11px] font-semibold uppercase tracking-wider border-[#FF4D1F]/30 text-[#FF4D1F]"
            >
              Legal
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Terms of Service
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: November 2026 · Applies to all users and bidders on INDIAbids
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-5">
          {SECTIONS.map((section) => (
            <article key={section.title} className="card-surface rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">{section.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {section.body}
              </p>
            </article>
          ))}

          <p className="text-xs text-muted-foreground pt-2">
            See also:{" "}
            <Link href="/privacy" className="text-[#FF4D1F] underline">
              Privacy Policy
            </Link>{" "}
            ·{" "}
            <Link href="/rules" className="text-[#FF4D1F] underline">
              Bidding Rules
            </Link>{" "}
            ·{" "}
            <Link href="/imprint" className="text-[#FF4D1F] underline">
              Imprint
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
