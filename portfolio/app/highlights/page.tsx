"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { ProofGallery } from "@/components/proof-gallery";
import { GitHubContributionGraph } from "@/components/github-contributions";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

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
              03 / Proof &amp; Activity
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[940px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800">
          <Reveal>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                03 / Proof &amp; Activity
              </p>
              <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                Screenshots, Proof &amp; Activity
              </h1>
              <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                Upload multiple screenshots or proof images below — displayed in a left-to-right moving marquee strip.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14 space-y-8">
          <ProofGallery />
          <GitHubContributionGraph
            defaultUsername={PORTFOLIO_PROFILE.githubUsername}
          />
        </section>
      </main>
    </div>
  );
}
