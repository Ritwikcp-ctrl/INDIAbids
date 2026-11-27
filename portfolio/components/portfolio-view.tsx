"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  Check,
  Command,
  Copy,
  FileText,
  FolderGit2,
  Layers,
  Mail,
  Search,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import SocialFlipButton, { type SocialItem } from "@/components/social-flip-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/dialog";
import { Reveal } from "@/components/reveal";
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

const HEAT_LEVELS = [
  "bg-black/[0.05] dark:bg-white/[0.05]",
  "bg-[#FF4D1F]/25",
  "bg-[#FF4D1F]/45",
  "bg-[#FF4D1F]/70",
  "bg-[#FF4D1F]",
];

export function PortfolioView() {
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
    ];
    const q = cmdQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.section.toLowerCase().includes(q)
    );
  }, [cmdQuery]);

  const socialItems: SocialItem[] = [
    { letter: "G", icon: <FaGithub />, label: "GitHub", href: PORTFOLIO_PROFILE.socials.github },
    { letter: "X", icon: <FaTwitter />, label: "X / Twitter", href: PORTFOLIO_PROFILE.socials.twitter },
    { letter: "L", icon: <FaLinkedin />, label: "LinkedIn", href: PORTFOLIO_PROFILE.socials.linkedin },
    { letter: "M", icon: <FaEnvelope />, label: "Email Tejas", href: PORTFOLIO_PROFILE.socials.email },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#FF4D1F]/25 selection:text-[#FF4D1F]">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#FF4D1F] text-[11px] font-black text-white dark:text-[#111013]">
              T
            </span>
            <span className="text-sm font-bold tracking-tight text-foreground">
              {PORTFOLIO_PROFILE.name}
              <span className="font-normal text-muted-foreground"> | Developer</span>
            </span>
          </a>

          <nav className="hidden items-center gap-5 text-xs font-medium text-muted-foreground md:flex">
            <a href="#experience" className="transition-colors hover:text-foreground">Experience</a>
            <a href="#projects" className="transition-colors hover:text-foreground">Projects</a>
            <a href="#skills" className="transition-colors hover:text-foreground">Skills</a>
            <a href="#writing" className="transition-colors hover:text-foreground">Writing</a>
            <a href="#connect" className="transition-colors hover:text-foreground">Connect</a>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCmdOpen(true)}
              className="inline-flex h-8 cursor-pointer items-center gap-2 rounded-lg border border-border bg-card/80 px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-[#FF4D1F]/40 hover:text-foreground"
            >
              <Command className="h-3 w-3 text-[#FF4D1F]" />
              <span className="hidden sm:inline">Search</span>
              <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
                ⌘K
              </kbd>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl border-x border-border/60">
        <section className="relative border-b border-border/60 px-5 py-16 sm:px-10 sm:py-20">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[11px] font-medium text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#3FE0A0]" />
              <span>{PORTFOLIO_PROFILE.availability}</span>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-xs uppercase tracking-[0.12em] text-[#FF4D1F]">
                {PORTFOLIO_PROFILE.role} · {PORTFOLIO_PROFILE.location}
              </p>
              <h1 className="text-3xl font-extrabold leading-[1.12] tracking-[-0.03em] text-foreground sm:text-5xl">
                {PORTFOLIO_PROFILE.headline}
              </h1>
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              {PORTFOLIO_PROFILE.bio}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#experience"
                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#FF4D1F] px-5 text-xs font-semibold text-white transition-all hover:bg-[#E84317] active:scale-[0.98] dark:text-[#111013]"
              >
                View Experience
                <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
              <a
                href="#projects"
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-4 text-xs font-semibold text-foreground transition-colors hover:border-[#FF4D1F]/40"
              >
                Flagship Work
              </a>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-border bg-background px-4 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {copiedEmail ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#3FE0A0]" />
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

        <section id="experience" className="border-b border-border/60 px-5 py-14 sm:px-10">
          <Reveal>
            <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                  01 / Experience
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Engineering Timeline
                </h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Production Systems · Full-Stack
              </span>
            </div>
          </Reveal>

          <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
            {EXPERIENCE_ITEMS.map((exp, idx) => (
              <Reveal key={exp.id} delay={idx * 0.06}>
                <div className="relative pl-9">
                  <span
                    className={`absolute top-1.5 left-0 flex h-6 w-6 items-center justify-center rounded-full border bg-background ${
                      idx === 0
                        ? "border-[#FF4D1F] text-[#FF4D1F]"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    <Terminal className="h-3 w-3" />
                  </span>

                  <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-5 transition-colors hover:border-[#FF4D1F]/35 sm:p-6">
                    <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground sm:text-lg">
                            {exp.role}
                          </h3>
                          <span className="rounded-full border border-[#FF4D1F]/30 bg-[#FF4D1F]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF4D1F]">
                            {exp.type}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                          {exp.company} · {exp.location}
                        </p>
                      </div>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        {exp.period}
                      </span>
                    </div>

                    <p className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      {exp.summary}
                    </p>

                    <ul className="space-y-2 border-t border-border/50 pt-3">
                      {exp.highlights.map((bullet) => (
                        <li
                          key={bullet}
                          className="flex items-start gap-2 text-xs leading-relaxed text-foreground/85"
                        >
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF4D1F]" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md border border-border bg-background/70 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="projects" className="border-b border-border/60 px-5 py-14 sm:px-10">
          <Reveal>
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                  02 / Selected Works
                </p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  Projects &amp; Case Studies
                </h2>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                Click any card for architecture notes
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                  className="group cursor-pointer rounded-2xl border border-border bg-card/70 p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF4D1F]/45"
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FolderGit2 className="h-4 w-4 text-[#FF4D1F]" />
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {project.year} · {project.status}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground transition-colors group-hover:text-[#FF4D1F]">
                      Inspect <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-foreground transition-colors group-hover:text-[#FF4D1F] sm:text-xl">
                    {project.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-foreground/75">
                    {project.tagline}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                    {project.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {project.stack.map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-border bg-background/70 px-2 py-0.5 font-mono text-[10.5px] text-muted-foreground"
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

        <section id="highlights" className="space-y-10 border-b border-border/60 px-5 py-14 sm:px-10">
          <Reveal>
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                03 / Proof &amp; Activity
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Engineering Highlights
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {HIGHLIGHTS.map((item, idx) => (
              <Reveal key={item.title} delay={idx * 0.05}>
                <div className="space-y-2 rounded-2xl border border-border bg-card/50 p-5">
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#FF4D1F]/30 bg-[#FF4D1F]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#FF4D1F]">
                    <Sparkles className="h-3 w-3" /> {item.badge}
                  </span>
                  <h3 className="text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <div className="space-y-4 rounded-2xl border border-border bg-card/40 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    Shipping Cadence &amp; Open-Source Activity
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Connect your GitHub username in lib/portfolio-data.ts for live stats
                  </p>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
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

        <section id="skills" className="border-b border-border/60 px-5 py-14 sm:px-10">
          <Reveal>
            <div className="mb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                04 / Stack
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Skills &amp; Technologies
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SKILL_GROUPS.map((group, idx) => (
              <Reveal key={group.group} delay={idx * 0.05}>
                <div className="space-y-3 rounded-2xl border border-border bg-card/50 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Layers className="h-3.5 w-3.5 text-[#FF4D1F]" />
                    <span>{group.group}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.items.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-lg border border-border bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground/85"
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

        <section id="writing" className="border-b border-border/60 px-5 py-14 sm:px-10">
          <Reveal>
            <div className="mb-8">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                05 / Writing
              </p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
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
                  className="group flex w-full cursor-pointer flex-col justify-between gap-3 rounded-2xl border border-border bg-card/50 p-5 text-left transition-colors hover:border-[#FF4D1F]/45 sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                      <FileText className="h-3 w-3 text-[#FF4D1F]" />
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground transition-colors group-hover:text-[#FF4D1F] sm:text-base">
                      {post.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{post.summary}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#FF4D1F]" />
                </button>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="connect" className="px-5 py-14 sm:px-10">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-md space-y-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#FF4D1F]">
                06 / Connect
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Let&apos;s build something durable.
              </h2>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Reach out for full-stack roles, product builds, or technical collaborations.
              </p>
              <a
                href={PORTFOLIO_PROFILE.socials.email}
                className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-[#FF4D1F] hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                {PORTFOLIO_PROFILE.email}
              </a>
            </div>

            <div className="pt-3">
              <SocialFlipButton items={socialItems} />
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row">
            <span>&copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}</span>
            <span>Built with Next.js, TypeScript &amp; Framer Motion</span>
          </div>
        </section>
      </main>

      <Dialog open={cmdOpen} onOpenChange={setCmdOpen}>
        <DialogContent className="max-w-md rounded-2xl border-border bg-card/95 p-4 backdrop-blur-2xl">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Search className="h-4 w-4 text-[#FF4D1F]" />
            <input
              autoFocus
              value={cmdQuery}
              onChange={(e) => setCmdQuery(e.target.value)}
              placeholder="Type a section or action…"
              className="w-full bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              onClick={() => setCmdOpen(false)}
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto">
            {commandActions.map((act) => (
              <a
                key={act.href}
                href={act.href}
                onClick={() => setCmdOpen(false)}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-xs text-foreground/85 hover:bg-secondary hover:text-[#FF4D1F]"
              >
                <span>{act.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {act.section}
                </span>
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedProject)} onOpenChange={() => setSelectedProject(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-border bg-card p-6">
          {selectedProject && (
            <>
              <DialogHeader className="space-y-1">
                <span className="font-mono text-[11px] text-[#FF4D1F]">
                  {selectedProject.year} · {selectedProject.status}
                </span>
                <DialogTitle className="text-xl font-bold">
                  {selectedProject.title}
                </DialogTitle>
                <p className="text-xs text-muted-foreground">
                  {selectedProject.tagline}
                </p>
              </DialogHeader>

              <p className="mt-4 text-xs leading-relaxed text-foreground/85 sm:text-sm">
                {selectedProject.description}
              </p>

              <div className="mt-4 space-y-2 border-t border-border/60 pt-4">
                <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Key Architecture Notes
                </p>
                <ul className="space-y-2">
                  {selectedProject.architecture.map((pt) => (
                    <li key={pt} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#FF4D1F]" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
                <div className="flex flex-wrap gap-1.5">
                  {selectedProject.stack.map((t) => (
                    <span
                      key={t}
                      className="rounded border border-border bg-background px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                {selectedProject.liveHref && (
                  <a
                    href={selectedProject.liveHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full bg-[#FF4D1F] px-3.5 py-1.5 text-xs font-semibold text-white dark:text-[#111013]"
                  >
                    Open Live <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedPost)} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-border bg-card p-6">
          {selectedPost && (
            <>
              <DialogHeader className="space-y-1">
                <span className="font-mono text-[11px] text-[#FF4D1F]">
                  {selectedPost.date} · {selectedPost.readTime}
                </span>
                <DialogTitle className="text-xl font-bold leading-snug">
                  {selectedPost.title}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-4 space-y-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
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
