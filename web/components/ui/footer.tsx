"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SocialFlipButton from "@/components/ui/social-flip-button";

const FOOTER_COLUMNS = [
  {
    heading: "Platform",
    links: [
      { label: "Stats", href: "/stats" },
      { label: "Rules", href: "/rules" },
      { label: "FAQ", href: "/faq" },
      { label: "About", href: "/about" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Imprint", href: "/imprint" },
    ],
  },
];

const PORTFOLIO_URL = process.env.NEXT_PUBLIC_PORTFOLIO_URL;

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/70 bg-card/50 text-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 gap-12 py-12 sm:py-16 lg:grid-cols-12 border-b border-border/60">
          {/* Brand + Social Flip Button */}
          <div className="lg:col-span-6 flex flex-col justify-between gap-8">
            <div className="space-y-3">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FF4D1F] text-xs font-black tracking-tight text-white dark:text-[#111013]">
                  IB
                </span>
                <span className="text-xl font-bold tracking-[-0.02em] text-foreground">
                  INDIA<span className="font-black text-[#FF4D1F]">bids</span>
                </span>
              </Link>
              <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                Rank is what you pay. Relevance is where you compete. A deterministic paid leaderboard across 23 industry sectors and 36 Indian states &amp; UTs.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Connect with INDIAbids
              </p>
              <SocialFlipButton />
            </div>
          </div>

          {/* Non-duplicative Platform & Legal Columns */}
          <nav
            aria-label="Footer navigation"
            className="lg:col-span-6 grid grid-cols-2 gap-8 sm:gap-12 lg:pl-8"
          >
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.heading} className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#FF4D1F]">
                  {col.heading}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="group flex items-center justify-between border-b border-border/50 pb-2 text-sm sm:text-base font-semibold tracking-tight text-foreground/85 transition-colors duration-200 hover:border-[#FF4D1F] hover:text-[#FF4D1F]"
                      >
                        <span>{item.label}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF4D1F]" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom Meta Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="font-semibold text-foreground/85">
              &copy; {new Date().getFullYear()} INDIAbids
            </span>
            <span aria-hidden>·</span>
            <span>Permanent Cumulative Spend · Zero Subscriptions</span>
          </div>

          {PORTFOLIO_URL ? (
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <span>Made by</span>
              <span className="font-semibold text-foreground transition-colors duration-200 group-hover:text-[#FF4D1F]">
                Tejas | Developer
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF4D1F]" />
            </a>
          ) : (
            <Link
              href="/tejas"
              className="group inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors duration-200 hover:text-foreground"
            >
              <span>Made by</span>
              <span className="font-semibold text-foreground transition-colors duration-200 group-hover:text-[#FF4D1F]">
                Tejas | Developer
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF4D1F]" />
            </Link>
          )}
        </div>
      </div>
    </footer>
  );
}
