"use client";

import Link from "next/link";
import { ArrowLeft, Briefcase, ExternalLink, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/reveal";
import { EXPERIENCE_ITEMS, PORTFOLIO_PROFILE } from "@/lib/portfolio-data";

export default function ExperiencePage() {
  return (
    <div className="min-h-screen bg-[#fafafa] text-neutral-950 dark:bg-[#0a0a0a] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#fafafa]/90 backdrop-blur-md dark:border-neutral-800 dark:bg-[#0a0a0a]/90">
        <div className="mx-auto flex h-12 max-w-[820px] items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {PORTFOLIO_PROFILE.username}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
              01 / Experience Archive
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[820px] border-x border-neutral-200 dark:border-neutral-800 min-h-[calc(100vh-3rem)]">
        <section className="border-b border-neutral-200 px-5 sm:px-8 py-12 sm:py-14 dark:border-neutral-800">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  01 / Career &amp; Systems Timeline
                </p>
                <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  All Engineering Experience
                </h1>
                <p className="mt-2 max-w-xl text-sm text-neutral-600 dark:text-neutral-400">
                  Every role, production system, architecture ownership milestone, and stack shipped across web platforms and developer infrastructure.
                </p>
              </div>
              <span className="rounded-full border border-neutral-300 px-3 py-1 text-[11px] font-mono text-neutral-600 dark:border-neutral-700 dark:text-neutral-300">
                {EXPERIENCE_ITEMS.length} {EXPERIENCE_ITEMS.length === 1 ? "role" : "roles"}
              </span>
            </div>
          </Reveal>
        </section>

        <section className="px-5 sm:px-8 py-12 sm:py-14">
          <div className="relative pl-6 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-neutral-200 dark:before:bg-neutral-800 space-y-10">
            {EXPERIENCE_ITEMS.map((exp, idx) => (
              <Reveal key={exp.id} delay={idx * 0.05}>
                <article className="relative">
                  <span
                    aria-hidden="true"
                    className={`absolute -left-6 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[#fafafa] dark:border-[#0a0a0a] ${
                      idx === 0
                        ? "bg-neutral-950 dark:bg-white"
                        : "bg-neutral-400 dark:bg-neutral-600"
                    }`}
                  />

                  <div className="rounded-2xl border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-950 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
                          <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                            {exp.type}
                          </span>
                        </div>
                        <h2 className="mt-1 text-base sm:text-lg font-bold tracking-tight">
                          {exp.role}
                        </h2>
                        <p className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400">
                          {exp.company}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="inline-block rounded-full border border-neutral-300 px-2.5 py-0.5 text-[11px] font-mono dark:border-neutral-700">
                          {exp.period}
                        </span>
                        <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 sm:justify-end w-full">
                          <MapPin className="h-3 w-3" />
                          {exp.location}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                      {exp.summary}
                    </p>

                    <div className="space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                      <p className="text-[10.5px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                        Key Engineering Deliverables
                      </p>
                      <ul className="space-y-2">
                        {exp.highlights.map((bullet) => (
                          <li
                            key={bullet}
                            className="flex items-start gap-2.5 text-xs sm:text-[13px] text-neutral-700 dark:text-neutral-300"
                          >
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {exp.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {exp.link && (
                        <a
                          href={exp.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 hover:opacity-75"
                        >
                          Live Platform <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
