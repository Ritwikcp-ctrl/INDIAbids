"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Command,
  Copy,
  ExternalLink,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import SocialFlipButton, { type SocialItem } from "@/components/ui/social-flip-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reveal } from "@/components/ui/reveal";
import {
  CONTRIBUTION_WEEKS,
  EXPERIENCE_ITEMS,
  HIGHLIGHTS,
  PORTFOLIO_PROFILE,
  PROJECT_ITEMS,
  SKILL_GROUPS,
  WRITING_ITEMS,
  type ProjectItem,
  type WritingItem,
} from "@/lib/portfolio-data";
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

interface PortfolioViewProps {
  showBackToIndiabids?: boolean;
}

const HEAT_LEVELS = [
  "bg-black/[0.06] dark:bg-white/[0.06]",
  "bg-neutral-300 dark:bg-neutral-700",
  "bg-neutral-500 dark:bg-neutral-500",
  "bg-neutral-700 dark:bg-neutral-300",
  "bg-neutral-950 dark:bg-white",
];

export function PortfolioView({ showBackToIndiabids = false }: PortfolioViewProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState("");
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedPost, setSelectedPost] = useState<WritingItem | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setCmdOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const commandActions = useMemo(() => {
    const base = [
      { label: "Jump to Experience (#experience)", href: "#experience", section: "Section" },
      { label: "Jump to Projects (#projects)", href: "#projects", section: "Section" },
      { label: "Jump to Highlights (#highlights)", href: "#highlights", section: "Section" },
      { label: "Jump to Tech Stack (#skills)", href: "#skills", section: "Section" },
      { label: "Jump to Technical Notes (#writing)", href: "#writing", section: "Section" },
      { label: "Jump to Connect (#connect)", href: "#connect", section: "Section" },
      ...(showBackToIndiabids
        ? [{ label: "Open INDIAbids Live Platform", href: "/", section: "App" }]
        : []),
    ];
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.section.toLowerCase().includes(q)
    );
  }, [cmdQuery, showBackToIndiabids]);

  const socialItems: SocialItem[] = [
    {
      letter: "G",
      icon: <FaGithub />,
      label: "GitHub",
      href: PORTFOLIO_PROFILE.socials.github,
    },
    {
      letter: "X",
      icon: <FaTwitter />,
      label: "X / Twitter",
      href: PORTFOLIO_PROFILE.socials.twitter,
    },
    {
      letter: "L",
      icon: <FaLinkedin />,
      label: "LinkedIn",
      href: PORTFOLIO_PROFILE.socials.linkedin,
    },
    {
      letter: "M",
      icon: <FaEnvelope />,
      label: "Email Tejas",
      href: PORTFOLIO_PROFILE.socials.email,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-[#FAFAFA] font-sans transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      {/* Blueprint Top Bar */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#FAFAFA]/85 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0A0A0A]/85">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            {showBackToIndiabids && (
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="hidden sm:inline">INDIAbids</span>
              </Link>
            )}
            <a href="#" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-[11px] font-black text-white dark:bg-white dark:text-neutral-950">
                T
              </span>
              <span className="text-sm font-bold tracking-tight">
                {PORTFOLIO_PROFILE.name}
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                  {" "}| Developer
                </span>
              </span>
            </a>
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
            <a href="#experience" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              Experience
            </a>
            <a href="#projects" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              Projects
            </a>
            <a href="#skills" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              Skills
            </a>
            <a href="#writing" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              Writing
            </a>
            <a href="#connect" className="hover:text-neutral-950 dark:hover:text-white transition-colors">
              Connect
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-neutral-300 bg-white px-2.5 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
            >
              <Command className="h-3 w-3" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="rounded border border-neutral-300 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono dark:border-neutral-800 dark:bg-neutral-900">
                ⌘K
              </kbd>
            </button>
            <ThemeToggle compact monochrome />
          </div>
        </div>
      </header>

      {/* Main Blueprint Container */}
      <main className="mx-auto max-w-5xl border-x border-neutral-200 dark:border-neutral-800">
        {/* 1. HERO / INTRO */}
        <section className="relative border-b border-neutral-200 px-5 py-16 dark:border-neutral-800 sm:px-10 sm:py-20">
          <span aria-hidden className="pointer-events-none absolute top-2 left-2 text-[11px] font-mono text-neutral-400">+</span>
          <span aria-hidden className="pointer-events-none absolute top-2 right-2 text-[11px] font-mono text-neutral-400">+</span>

          <div className="space-y-6 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[11px] font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400">
              <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 dark:bg-white" />
              <span>{PORTFOLIO_PROFILE.availability}</span>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                {PORTFOLIO_PROFILE.role} · {PORTFOLIO_PROFILE.location}
              </p>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-[-0.03em] leading-[1.12]">
                {PORTFOLIO_PROFILE.headline}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
              {PORTFOLIO_PROFILE.bio}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#experience"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-neutral-950 px-5 text-xs font-semibold text-white transition-all hover:opacity-85 active:scale-[0.98] dark:bg-white dark:text-neutral-950"
              >
                View Experience
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#projects"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 text-xs font-semibold text-neutral-900 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:border-white"
              >
                Flagship Work
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-transparent px-4 text-xs font-medium text-neutral-600 transition-colors hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:text-white"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Copied {PORTFOLIO_PROFILE.email}</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>{PORTFOLIO_PROFILE.email}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* 2. EXPERIENCE TIMELINE (#experience) */}
        <section id="experience" className="border-b border-neutral-200 px-5 py-14 dark:border-neutral-800 sm:px-10">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  01 / Experience
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Engineering Timeline
                </h2>
              </div>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Production Systems · Full-Stack
              </span>
            </div>
          </Reveal>

          <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
            {EXPERIENCE_ITEMS.map((exp, idx) => (
              <Reveal key={exp.id} delay={idx * 0.06}>
                <div className="relative pl-9">
                  <span
                    className={`absolute top-1.5 left-0 flex h-6 w-6 items-center justify-center rounded-full border bg-[#FAFAFA] dark:bg-[#0A0A0A] ${
                      idx === 0
                        ? "border-neutral-950 text-neutral-950 dark:border-white dark:text-white"
                        : "border-neutral-300 text-neutral-500 dark:border-neutral-800 dark:text-neutral-400"
                    }`}
                  >
                    <Terminal className="h-3 w-3" />
                  </span>

                  <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base sm:text-lg font-bold">
                            {exp.role}
                          </h3>
                          <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                            {exp.type}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mt-0.5">
                          {exp.company} · {exp.location}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 shrink-0">
                        {exp.period}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      {exp.summary}
                    </p>

                    <ul className="space-y-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                      {exp.highlights.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap gap-1.5">
                        {exp.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      {exp.link && showBackToIndiabids && (
                        <Link
                          href={exp.link}
                          className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 hover:opacity-75"
                        >
                          Live Product <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 3. PROJECTS SHOWCASE (#projects) */}
        <section id="projects" className="border-b border-neutral-200 px-5 py-14 dark:border-neutral-800 sm:px-10">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  02 / Selected Works
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                  Projects &amp; Case Studies
                </h2>
              </div>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                Click any card for architecture notes
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROJECT_ITEMS.map((project, idx) => (
              <Reveal
                key={project.id}
                delay={idx * 0.06}
                className={project.featured ? "md:col-span-2" : ""}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedProject(project)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedProject(project);
                    }
                  }}
                  className="group cursor-pointer rounded-2xl border border-neutral-200 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4" />
                      <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        {project.year} · {project.status}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-white transition-colors">
                      Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold">{project.title}</h3>
                  <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300 mt-0.5">
                    {project.tagline}
                  </p>
                  <p className="mt-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4. HIGHLIGHTS & GITHUB ACTIVITY (#highlights) */}
        <section id="highlights" className="border-b border-neutral-200 px-5 py-14 dark:border-neutral-800 sm:px-10 space-y-10">
          <Reveal>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                03 / Proof &amp; Activity
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                Engineering Highlights
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {HIGHLIGHTS.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.05}>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-2 dark:border-neutral-800 dark:bg-neutral-950">
                  <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                    <Sparkles className="h-3 w-3" /> {item.badge}
                  </span>
                  <h3 className="text-sm font-bold">{item.title}</h3>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-4 dark:border-neutral-800 dark:bg-neutral-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold">
                    Shipping Cadence &amp; Open-Source Activity
                  </p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                    Connect your GitHub username in portfolio-data.ts for live stats
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  <span>Less</span>
                  {HEAT_LEVELS.map((cls, i) => (
                    <span key={i} className={`h-2.5 w-2.5 rounded-[2px] ${cls}`} />
                  ))}
                  <span>More</span>
                </div>
              </div>

              <div className="overflow-x-auto pb-1">
                <div className="inline-flex gap-1.5">
                  {CONTRIBUTION_WEEKS.map((week, wIdx) => (
                    <div key={wIdx} className="flex flex-col gap-1.5">
                      {week.map((level, dIdx) => (
                        <span
                          key={`${wIdx}-${dIdx}`}
                          className={`h-3 w-3 rounded-[3px] ${HEAT_LEVELS[level]}`}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 5. SKILLS & TECH STACK (#skills) */}
        <section id="skills" className="border-b border-neutral-200 px-5 py-14 dark:border-neutral-800 sm:px-10">
          <Reveal>
            <div className="mb-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                04 / Stack
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                Skills &amp; Technologies
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SKILL_GROUPS.map((group, idx) => (
              <Reveal key={group.group} delay={idx * 0.05}>
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-3 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <Layers className="h-3.5 w-3.5" />
                    <span>{group.group}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-medium text-neutral-800 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 6. WRITING / TECHNICAL NOTES (#writing) */}
        <section id="writing" className="border-b border-neutral-200 px-5 py-14 dark:border-neutral-800 sm:px-10">
          <Reveal>
            <div className="mb-8">
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                05 / Writing
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
                Engineering Notes
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            {WRITING_ITEMS.map((post, idx) => (
              <Reveal key={post.slug} delay={idx * 0.05}>
                <button
                  type="button"
                  onClick={() => setSelectedPost(post)}
                  className="group flex w-full cursor-pointer flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                      <FileText className="h-3 w-3" />
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-sm sm:text-base font-bold">{post.title}</h3>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                      {post.summary}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950 dark:group-hover:text-white" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 7. CONNECT & FOOTER (#connect) */}
        <section id="connect" className="px-5 py-14 sm:px-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="space-y-2 max-w-md">
              <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                06 / Connect
              </p>
              <h2 className="text-2xl font-bold tracking-tight">
                Let&apos;s build something durable.
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                Reach out for full-stack roles, product builds, or technical collaborations.
              </p>
              <a
                href={PORTFOLIO_PROFILE.socials.email}
                className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold underline underline-offset-4 hover:opacity-75"
              >
                <Mail className="h-3.5 w-3.5" />
                {PORTFOLIO_PROFILE.email}
              </a>
            </div>

            <div className="space-y-2 pt-3">
              <SocialFlipButton
                items={socialItems}
                containerClassName="border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                frontClassName="border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                backClassName="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                lineClassName="via-neutral-900/50 dark:via-white/50"
              />
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
            <span>&copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}</span>
            <span>Built with Next.js, TypeScript &amp; Framer Motion</span>
          </div>
        </section>
      </main>

      {/* Command Palette (Cmd/Ctrl + K) */}
      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent className="max-w-md rounded-2xl border-neutral-200 bg-white p-4 text-neutral-950 backdrop-blur-2xl dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 dark:border-neutral-800">
            <Search className="h-4 w-4" />
            <input
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Type a section or action…"
              className="w-full bg-transparent text-xs outline-none placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={() => setCmdOpen(false)}
              className="rounded p-1 text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 max-h-64 overflow-y-auto space-y-1">
            {commandActions.map((act) => (
              <a
                key={act.href}
                href={act.href}
                onClick={() => setCmdOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-900"
              >
                <span>{act.label}</span>
                <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                  {act.section}
                </span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Architecture Modal */}
      <Dialog open={Boolean(selectedProject)} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-neutral-200 bg-white p-6 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
          {selectedProject && (
            <>
              <DialogHeader className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {selectedProject.year} · {selectedProject.status}
                </span>
                <DialogTitle className="text-xl font-bold">
                  {selectedProject.title}
                </DialogTitle>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selectedProject.tagline}
                </p>
              </DialogHeader>

              <p className="mt-4 text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
                {selectedProject.description}
              </p>

              <div className="mt-4 space-y-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <p className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Key Architecture Notes
                </p>
                <ul className="space-y-2">
                  {selectedProject.architecture.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-950 dark:bg-white" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {selectedProject.liveHref && (
                  <Link
                    href={selectedProject.liveHref}
                    onClick={() => setSelectedProject(null)}
                    className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3.5 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                  >
                    Open Live <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Writing Reader Modal */}
      <Dialog open={Boolean(selectedPost)} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-neutral-200 bg-white p-6 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
          {selectedPost && (
            <>
              <DialogHeader className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {selectedPost.date} · {selectedPost.readTime}
                </span>
                <DialogTitle className="text-xl font-bold leading-snug">
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {selectedPost.body.map((para, idx) => (
                  <p key={idx}>{para}</p>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
