"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { HIGHLIGHTS, PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

export default function HighlightsPage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[940px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              03 / Engineering Highlights
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[940px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  03 / Proof &amp; Activity
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  All Engineering Highlights
                </h1>
                <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  System design breakthroughs, payment reconciliation pipelines, security audits, and milestones.
                </p>
              </div>
              <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                {HIGHLIGHTS.length} {HIGHLIGHTS.length === 1 ? "highlight" : "highlights"}
              </span>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.04}>
                <div className="h-full rounded-2xl border border-neutral-200 bg-white p-6 space-y-2.5 dark:border-neutral-800 dark:bg-neutral-950">
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900">
                    <Sparkles className="h-3 w-3" /> {item.badge}
                  </span>
                  <h2 className="text-base font-bold">{item.title}</h2>
                  <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
