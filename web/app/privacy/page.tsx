"use client";

import Link from "next/link";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";

const PRIVACY_ITEMS = [
  {
    title: "1. Information You Provide",
    body: "When you place a bid or register an account, we collect your business name, website URL, optional description, receipt email address, and (if creating an account) your name and hashed password.",
  },
  {
    title: "2. Payment & Transaction Records",
    body: "Card, UPI, and NetBanking checkout is handled directly by Razorpay. INDIAbids does not store raw card numbers or UPI PINs; we store order IDs, payment IDs, amounts in paise, and verification status for deterministic leaderboard accounting.",
  },
  {
    title: "3. Cookies & Cryptographic Tokens",
    body: "Authenticated sessions use HttpOnly refresh cookies for secure token rotation. Anonymous listings generate a one-time manage token whose cryptographic hash is stored on our servers.",
  },
  {
    title: "4. Public Leaderboard Visibility",
    body: "Submitted business names, descriptions, website links, and cumulative board spend are intentionally displayed publicly on the leaderboards. Receipt emails and private account credentials are never shown on public boards.",
  },
  {
    title: "5. Data Retention & Requests",
    body: "We do not sell personal data to third parties. For access, correction, or deletion inquiries, contact hello@indiabids.in.",
  },
];

export default function PrivacyPage() {
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
              Legal &amp; Privacy
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Privacy Policy
            </h1>
            <p className="text-xs text-muted-foreground">
              Last updated: November 2026 · How INDIAbids handles bidder and account information
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-5">
          {PRIVACY_ITEMS.map((item) => (
            <article key={item.title} className="card-surface rounded-2xl p-6 space-y-2">
              <h2 className="text-base font-bold text-foreground">{item.title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {item.body}
              </p>
            </article>
          ))}

          <p className="text-xs text-muted-foreground pt-2">
            Related:{" "}
            <Link href="/terms" className="text-[#FF4D1F] underline">
              Terms of Service
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
