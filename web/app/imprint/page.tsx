"use client";

import Link from "next/link";
import { Mail, Building2, ShieldCheck, Globe } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { Footer } from "@/components/ui/footer";
import { Badge } from "@/components/ui/badge";

export default function ImprintPage() {
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
              Operator Information
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
              Imprint &amp; Legal Disclosure
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Statutory service, operator contact, and compliance information for INDIAbids.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-surface rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D1F]">
                <Building2 className="h-4 w-4" /> Platform
              </div>
              <p className="text-base font-bold text-foreground">INDIAbids</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Deterministic Paid Leaderboard for Indian Businesses, Creators &amp; Local Merchants.
              </p>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D1F]">
                <Mail className="h-4 w-4" /> Contact &amp; Takedowns
              </div>
              <p className="text-base font-bold text-foreground">
                <a href="mailto:hello@indiabids.in" className="hover:text-[#FF4D1F] transition-colors">
                  hello@indiabids.in
                </a>
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For listing verification, billing support, privacy requests, or abuse notices.
              </p>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D1F]">
                <Globe className="h-4 w-4" /> Jurisdiction
              </div>
              <p className="text-base font-bold text-foreground">Republic of India</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                All transactions are denominated in Indian Rupees (INR) across National &amp; 36 State/UT boards.
              </p>
            </div>

            <div className="card-surface rounded-2xl p-6 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#FF4D1F]">
                <ShieldCheck className="h-4 w-4" /> Payment Partner
              </div>
              <p className="text-base font-bold text-foreground">Razorpay</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                UPI, card, and NetBanking payments verified server-side via Razorpay webhook signatures.
              </p>
            </div>
          </div>

          <div className="card-surface rounded-2xl p-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
            <span>Review platform policies:</span>
            <div className="flex flex-wrap items-center gap-4 font-semibold">
              <Link href="/rules" className="text-foreground hover:text-[#FF4D1F]">
                Rules
              </Link>
              <Link href="/terms" className="text-foreground hover:text-[#FF4D1F]">
                Terms
              </Link>
              <Link href="/privacy" className="text-foreground hover:text-[#FF4D1F]">
                Privacy
              </Link>
              <Link href="/faq" className="text-foreground hover:text-[#FF4D1F]">
                FAQ
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
