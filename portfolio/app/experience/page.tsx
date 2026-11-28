"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { EditableExperienceList } from "@/components/experience-section";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200/80 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800/80 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[780px] items-center justify-between px-5 sm:px-7">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              Experience
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] border-x border-neutral-200/80 dark:border-neutral-800/80 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200/80 px-5 sm:px-7 py-10 sm:py-12 dark:border-neutral-800/80">
          <Reveal>
            <div>
              <p className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                01 / Experience
              </p>
              <h1 className="mt-1 text-2xl sm:text-[28px] font-semibold tracking-[-0.02em]">
                Experience
              </h1>
              <p className="mt-1.5 max-w-xl text-[13.5px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Engineering roles, startups, and builds.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-7 py-10 sm:py-12">
          <EditableExperienceList />
        </section>
      </main>
    </div>
  );
}
