"use client";

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Calendar,
  Camera,
  Check,
  Copy,
  ExternalLink,
  FileText,
  FolderGit2,
  ImagePlus,
  Link2,
  Mail,
  MapPin,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreepyButton } from "@/components/ui/creepy-button";
import PulseHeart from "@/components/ui/pulse-heart";
import SlingButton from "@/components/ui/sling-button";
import SocialFlipButton, { type SocialItem } from "@/components/ui/social-flip-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Reveal } from "@/components/ui/reveal";
import { GitHubContributionGraph } from "@/components/portfolio/github-contributions";
import { SkillsSection } from "@/components/portfolio/skills-section";
import {
  BLOG_POSTS,
  EXPERIENCE_ITEMS,
  HIGHLIGHTS,
  PORTFOLIO_PROFILE,
  PROJECT_ITEMS,
  type BlogPost,
  type ProjectItem,
} from "@/lib/portfolio-data";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";

interface PortfolioViewProps {
  showBackToIndiabids?: boolean;
}

const INDEX_SECTIONS = [
  { id: "profile", num: "00", label: "Profile" },
  { id: "experience", num: "01", label: "Experience" },
  { id: "projects", num: "02", label: "Projects" },
  { id: "highlights", num: "03", label: "Highlights" },
  { id: "skills", num: "04", label: "Skills" },
  { id: "blogs", num: "05", label: "Blogs" },
  { id: "connect", num: "06", label: "Connect" },
];

const imageListeners = new Set<() => void>();

function subscribeImages(cb: () => void) {
  imageListeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    imageListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function saveLocalImage(key: string, dataUrl: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (dataUrl) localStorage.setItem(key, dataUrl);
    else localStorage.removeItem(key);
  } catch {
    // Ignore storage quota errors
  }
  imageListeners.forEach((cb) => cb());
}

function useStoredImage(key: string, fallback = "") {
  return useSyncExternalStore(
    subscribeImages,
    () => localStorage.getItem(key) ?? fallback,
    () => fallback
  );
}

const emptySubscribe = () => () => {};

function readImageFile(file: File, onDone: (dataUrl: string) => void) {
  const reader = new FileReader();
  reader.onload = () => {
    if (typeof reader.result === "string") onDone(reader.result);
  };
  reader.readAsDataURL(file);
}

export function PortfolioView({ showBackToIndiabids = false }: PortfolioViewProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDark = !mounted || resolvedTheme === "dark";

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeSection, setActiveSection] = useState("profile");
  const [pasteTarget, setPasteTarget] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);

  // Email composer state for SlingButton
  const [senderEmail, setSenderEmail] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [mailSentNotice, setMailSentNotice] = useState(false);

  const bannerSrc = useStoredImage("tejas_portfolio_banner", PORTFOLIO_PROFILE.bannerImage);
  const avatarSrc = useStoredImage("tejas_portfolio_avatar", PORTFOLIO_PROFILE.avatarImage);

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const elements = INDEX_SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target?.id) {
          setActiveSection(visible.target.id);
        }
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0.01 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!pasteTarget) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            readImageFile(file, (dataUrl) => {
              saveLocalImage(pasteTarget, dataUrl);
              setPasteTarget(null);
            });
            e.preventDefault();
            return;
          }
        }
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [pasteTarget]);

  const copyEmail = () => {
    navigator.clipboard.writeText(PORTFOLIO_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = mailSubject.trim() || "Hello Tejas — Project Inquiry";
    const bodyLines = [
      senderEmail.trim() ? `From: ${senderEmail.trim()}` : "",
      mailMessage.trim() || "Hi Tejas, I'd love to connect about...",
    ].filter(Boolean);
    const mailtoUrl = `mailto:${PORTFOLIO_PROFILE.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n\n"))}`;
    window.location.href = mailtoUrl;
    setMailSentNotice(true);
    setTimeout(() => setMailSentNotice(false), 3500);
  };

  const socialItems: SocialItem[] = [
    { letter: "G", icon: <FaGithub />, label: "GitHub", href: PORTFOLIO_PROFILE.socials.github },
    { letter: "X", icon: <FaTwitter />, label: "X / Twitter", href: PORTFOLIO_PROFILE.socials.twitter },
    { letter: "L", icon: <FaLinkedin />, label: "LinkedIn", href: PORTFOLIO_PROFILE.socials.linkedin },
    { letter: "M", icon: <FaEnvelope />, label: "Email Tejas", href: PORTFOLIO_PROFILE.socials.email },
  ];

  const basePath = showBackToIndiabids ? "/tejas" : "";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-[#FAFAFA] font-sans transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
      <input
        ref={bannerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readImageFile(file, (url) => saveLocalImage("tejas_portfolio_banner", url));
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readImageFile(file, (url) => saveLocalImage("tejas_portfolio_avatar", url));
        }}
      />

      {/* Top Header with PulseHeart + ThemeToggle */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#FAFAFA]/85 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0A0A0A]/85">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2.5">
            {showBackToIndiabids && (
              <Link
                href="/"
                className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
              >
                <ArrowLeft className="h-3 w-3" />
                <span className="hidden sm:inline">INDIAbids</span>
              </Link>
            )}
            <a href="#profile" className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-[11px] font-black text-white dark:bg-white dark:text-neutral-950">
                T
              </span>
              <span className="text-xs sm:text-sm font-bold tracking-tight">
                {PORTFOLIO_PROFILE.name}
                <span className="font-normal text-neutral-500 dark:text-neutral-400">
                  {" "}| Developer
                </span>
              </span>
            </a>
          </div>

          <div className="flex items-center gap-2.5">
            <PulseHeart
              count={0}
              liked={liked}
              onChange={(nextLiked) => setLiked(nextLiked)}
              showCount
              icon="heart"
              idleOutline
              size={20}
              corner={24}
              likedColor="#ff4d6d"
              idleColor={isDark ? "#a1a1aa" : "#52525b"}
              pillColor={isDark ? "#18181b" : "#f4f4f5"}
              textColor={isDark ? "#fafafa" : "#09090b"}
              duration={560}
              dotSize={0.3}
              overshoot={1.7}
              beat={3}
              rollDuration={350}
            />
            <ThemeToggle compact monochrome />
          </div>
        </div>
      </header>

      {/* Broader Frame (max-w-[940px]) + Right-Side Index */}
      <div className="mx-auto flex max-w-[1200px] justify-center gap-8 px-3 sm:px-5">
        <main className="w-full max-w-[940px] border-x border-neutral-200 dark:border-neutral-800">
          {/* 00. TWITTER/X-STYLE PROFILE + BANNER & PHOTO SLOTS */}
          <section
            id="profile"
            className="border-b border-neutral-200 dark:border-neutral-800"
          >
            <div
              tabIndex={0}
              onClick={() => setPasteTarget("tejas_portfolio_banner")}
              onFocus={() => setPasteTarget("tejas_portfolio_banner")}
              className="group relative h-44 sm:h-52 w-full overflow-hidden border-b border-neutral-200 bg-neutral-100 outline-none dark:border-neutral-800 dark:bg-neutral-900/70"
            >
              {bannerSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={bannerSrc}
                  alt="Profile cover banner"
                  className="h-full w-full object-cover grayscale"
                />
              ) : (
                <div
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-center px-4"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(120,120,120,0.22) 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <ImagePlus className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                  <p className="text-[11px] font-mono text-neutral-600 dark:text-neutral-400">
                    {pasteTarget === "tejas_portfolio_banner"
                      ? "Press Ctrl+V / Cmd+V to paste banner image, or Upload"
                      : "Cover Banner Slot — Click & press Ctrl+V or Upload"}
                  </p>
                </div>
              )}

              <div className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-85 group-hover:opacity-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    bannerInputRef.current?.click();
                  }}
                  className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white/90 px-3 py-1 text-[10.5px] font-semibold text-neutral-900 backdrop-blur-md transition-colors hover:bg-white dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
                >
                  <Camera className="h-3 w-3" />
                  <span>{bannerSrc ? "Change Banner" : "Upload Banner"}</span>
                </button>
                {bannerSrc && (
                  <button
                    type="button"
                    aria-label="Reset banner"
                    onClick={(e) => {
                      e.stopPropagation();
                      saveLocalImage("tejas_portfolio_banner", null);
                    }}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-8 pb-8">
              <div className="flex items-end justify-between gap-3">
                <div className="relative -mt-12 sm:-mt-14">
                  <div
                    tabIndex={0}
                    onClick={() => setPasteTarget("tejas_portfolio_avatar")}
                    onFocus={() => setPasteTarget("tejas_portfolio_avatar")}
                    title="Click and press Ctrl+V or click camera to upload photo"
                    className="group relative flex h-24 w-24 sm:h-28 sm:w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-[#FAFAFA] bg-neutral-200 dark:border-[#0A0A0A] dark:bg-neutral-900"
                  >
                    {avatarSrc ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={avatarSrc}
                        alt="Tejas profile photo"
                        className="h-full w-full object-cover grayscale"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-0.5 text-center">
                        <span className="text-xl font-black tracking-tight">T</span>
                        <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                          {pasteTarget === "tejas_portfolio_avatar" ? "Ctrl+V" : "PHOTO"}
                        </span>
                      </div>
                    )}

                    <button
                      type="button"
                      aria-label="Upload profile photo"
                      onClick={(e) => {
                        e.stopPropagation();
                        avatarInputRef.current?.click();
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  {avatarSrc && (
                    <button
                      type="button"
                      aria-label="Remove profile photo"
                      onClick={() => saveLocalImage("tejas_portfolio_avatar", null)}
                      className="absolute -right-1 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 text-xs font-semibold text-neutral-900 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:border-white"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Email</span>
                      </>
                    )}
                  </button>
                  <a
                    href={PORTFOLIO_PROFILE.socials.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-neutral-950 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-neutral-950"
                  >
                    <span>Follow</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              <div className="mt-4 space-y-3.5">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {PORTFOLIO_PROFILE.name}
                    </h1>
                    <BadgeCheck className="h-5 w-5 text-neutral-950 dark:text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400">
                    {PORTFOLIO_PROFILE.username} · {PORTFOLIO_PROFILE.role}
                  </p>
                </div>

                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
                  {PORTFOLIO_PROFILE.bio}
                </p>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {PORTFOLIO_PROFILE.location}
                  </span>
                  <Link
                    href={PORTFOLIO_PROFILE.websiteHref}
                    className="inline-flex items-center gap-1.5 font-medium text-neutral-900 hover:underline dark:text-white"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {PORTFOLIO_PROFILE.websiteLabel}
                  </Link>
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {PORTFOLIO_PROFILE.joined}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-5 pt-1 text-xs">
                  <span>
                    <strong className="font-bold">3+</strong>{" "}
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Production Builds
                    </span>
                  </span>
                  <span>
                    <strong className="font-bold">23</strong>{" "}
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Sectors Shipped
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 dark:bg-white" />
                    Available for builds
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 01. EXPERIENCE TIMELINE (#experience) */}
          <section
            id="experience"
            className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800"
          >
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    01 / Experience
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                    Engineering Timeline
                  </h2>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push(`${basePath}/experience`)}
                  className="rounded-full min-w-[6.4em] bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  coverClassName="rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 px-3.5 py-1.5 text-[11px] font-semibold min-w-[6.4em]"
                >
                  View All →
                </CreepyButton>
              </div>
            </Reveal>

            <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-neutral-200 dark:before:bg-neutral-800">
              {EXPERIENCE_ITEMS.slice(0, 2).map((exp, idx) => (
                <Reveal key={exp.id} delay={idx * 0.05}>
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

                    <div className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6 space-y-3.5 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm sm:text-base font-bold">{exp.role}</h3>
                            <span className="rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold dark:border-neutral-800 dark:bg-neutral-900">
                              {exp.type}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
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

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
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

                        {exp.link && showBackToIndiabids && (
                          <Link
                            href={exp.link}
                            className="inline-flex items-center gap-1 text-xs font-semibold underline underline-offset-4 hover:opacity-75"
                          >
                            Live <ExternalLink className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 02. PROJECTS SHOWCASE WITH IMAGE SLOTS (#projects) */}
          <section
            id="projects"
            className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800"
          >
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    02 / Projects
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                    Selected Builds
                  </h2>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push(`${basePath}/projects`)}
                  className="rounded-full min-w-[6.4em] bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  coverClassName="rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 px-3.5 py-1.5 text-[11px] font-semibold min-w-[6.4em]"
                >
                  View All →
                </CreepyButton>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PROJECT_ITEMS.slice(0, 2).map((project, idx) => (
                <Reveal key={project.id} delay={idx * 0.05}>
                  <ProjectCard
                    project={project}
                    pasteTarget={pasteTarget}
                    onSelectPasteTarget={setPasteTarget}
                    onInspect={() => setSelectedProject(project)}
                  />
                </Reveal>
              ))}
            </div>
          </section>

          {/* 03. HIGHLIGHTS & CONTRIBUTION MATRIX (#highlights) */}
          <section
            id="highlights"
            className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800 space-y-8"
          >
            <Reveal>
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  03 / Proof &amp; Activity
                </p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                  Engineering Highlights
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {HIGHLIGHTS.map((item, idx) => (
                <Reveal key={item.title} delay={idx * 0.04}>
                  <div className="h-full rounded-2xl border border-neutral-200 bg-white p-5 space-y-2 dark:border-neutral-800 dark:bg-neutral-950">
                    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider dark:border-neutral-800 dark:bg-neutral-900">
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
              <GitHubContributionGraph
                defaultUsername={PORTFOLIO_PROFILE.githubUsername}
              />
            </Reveal>
          </section>

          {/* 04. SKILLS (#skills) */}
          <SkillsSection />

          {/* 05. BLOGS (#blogs) */}
          <section
            id="blogs"
            className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800"
          >
            <Reveal>
              <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    05 / Blogs
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                    Blogs &amp; Engineering Notes
                  </h2>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push(`${basePath}/blogs`)}
                  className="rounded-full min-w-[6.4em] bg-neutral-800 border-neutral-300 dark:border-neutral-700"
                  coverClassName="rounded-full bg-neutral-950 hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-neutral-950 px-3.5 py-1.5 text-[11px] font-semibold min-w-[6.4em]"
                >
                  View All →
                </CreepyButton>
              </div>
            </Reveal>

            <div className="space-y-4">
              {BLOG_POSTS.slice(0, 2).map((post, idx) => (
                <Reveal key={post.slug} delay={idx * 0.04}>
                  <button
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className="group flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-5 text-left transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-white"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="rounded border border-neutral-300 bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100">
                          {post.category}
                        </span>
                        <span>{post.date}</span>
                        <span>·</span>
                        <span>{post.readTime}</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-bold">{post.title}</h3>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                        {post.summary}
                      </p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neutral-950 dark:group-hover:text-white" />
                  </button>
                </Reveal>
              ))}
            </div>
          </section>

          {/* 06. CONNECT & SLINGBUTTON EMAIL COMPOSER (#connect) */}
          <section id="connect" className="px-5 sm:px-8 py-14 sm:py-16 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 space-y-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                  06 / Connect
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Send an Email
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Pull and release the sling button (or click/press Enter) to send a message directly to{" "}
                  <span className="font-mono text-neutral-950 dark:text-white">
                    {PORTFOLIO_PROFILE.email}
                  </span>
                  .
                </p>

                <div className="pt-2">
                  <SocialFlipButton
                    items={socialItems}
                    containerClassName="border-neutral-300 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                    frontClassName="border-neutral-300 bg-neutral-100 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
                    backClassName="bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                    lineClassName="via-neutral-900/50 dark:via-white/50"
                  />
                </div>
              </div>

              {/* Monochrome Email Box + SlingButton */}
              <div className="md:col-span-7 rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Your Email
                    </label>
                    <input
                      type="email"
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none transition-colors focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={mailSubject}
                      onChange={(e) => setMailSubject(e.target.value)}
                      placeholder="Project / Collaboration"
                      className="h-9 w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none transition-colors focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-[10.5px] font-mono uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                    Message
                  </label>
                  <textarea
                    rows={3}
                    value={mailMessage}
                    onChange={(e) => setMailMessage(e.target.value)}
                    placeholder="Write your message to Tejas…"
                    className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none transition-colors focus:border-neutral-900 dark:border-neutral-800 dark:bg-[#0A0A0A] dark:focus:border-white"
                  />
                </div>

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                    {mailSentNotice ? (
                      <span className="inline-flex items-center gap-1 text-neutral-950 dark:text-white font-semibold">
                        <Check className="h-3.5 w-3.5" /> Mail composer opened!
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" />
                        Drag or tap to send
                      </span>
                    )}
                  </div>

                  <SlingButton
                    onSend={handleSendEmail}
                    padColor={isDark ? "#f5f5f5" : "#0a0a0a"}
                    iconColor={isDark ? "#18181b" : "#fafafa"}
                    accentColor={isDark ? "#f5f5f5" : "#0a0a0a"}
                    wellColor={isDark ? "#27272a" : "#e4e4e7"}
                    bandColor={isDark ? "#52525b" : "#a1a1aa"}
                    size={50}
                    strokeWidth={3}
                    armAt={44}
                    maxPull={140}
                    launchSpeed={2600}
                    recoil={0.2}
                    flight={110}
                    particles={14}
                    spread={60}
                    axis="any"
                    tapSends
                    ariaLabel="Send email to Tejas"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <span>&copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}</span>
              <span>Monochrome Blueprint · Next.js &amp; Motion</span>
            </div>
          </section>
        </main>

        {/* STICKY RIGHT-SIDE INDEX RAIL (no tip) */}
        <aside className="hidden lg:block w-44 shrink-0 pt-12">
          <div className="sticky top-20 space-y-3 border-l border-neutral-200 pl-4 dark:border-neutral-800">
            <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
              Index
            </p>
            <nav aria-label="Section index" className="flex flex-col gap-2">
              {INDEX_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`group flex items-center gap-2 py-0.5 text-xs transition-colors ${
                      isActive
                        ? "font-bold text-neutral-950 dark:text-white"
                        : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
                    }`}
                  >
                    <span
                      className={`h-px transition-all ${
                        isActive
                          ? "w-4 bg-neutral-950 dark:bg-white"
                          : "w-2 bg-neutral-300 group-hover:w-3 dark:bg-neutral-700"
                      }`}
                    />
                    <span className="font-mono text-[10px] opacity-60">
                      {sec.num}
                    </span>
                    <span>{sec.label}</span>
                  </a>
                );
              })}
            </nav>
          </div>
        </aside>
      </div>

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

      {/* Blog Reader Modal */}
      <Dialog open={Boolean(selectedPost)} onOpenChange={() => setSelectedPost(null)}>
        <DialogContent className="max-w-lg rounded-2xl border-neutral-200 bg-white p-6 text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
          {selectedPost && (
            <>
              <DialogHeader className="space-y-1">
                <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
                  {selectedPost.category} · {selectedPost.date} · {selectedPost.readTime}
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

function ProjectCard({
  project,
  pasteTarget,
  onSelectPasteTarget,
  onInspect,
}: {
  project: ProjectItem;
  pasteTarget: string | null;
  onSelectPasteTarget: (key: string) => void;
  onInspect: () => void;
}) {
  const storageKey = `tejas_portfolio_project_${project.id}`;
  const imgSrc = useStoredImage(storageKey, project.image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="h-full rounded-2xl border border-neutral-200 bg-white overflow-hidden transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-600">
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readImageFile(file, (url) => saveLocalImage(storageKey, url));
        }}
      />

      <div
        tabIndex={0}
        onClick={() => onSelectPasteTarget(storageKey)}
        onFocus={() => onSelectPasteTarget(storageKey)}
        className="group relative h-40 w-full border-b border-neutral-200 bg-neutral-100 outline-none dark:border-neutral-800 dark:bg-neutral-900/60"
      >
        {imgSrc ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={imgSrc}
            alt={`${project.title} preview`}
            className="h-full w-full object-cover grayscale"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-4 text-center">
            <ImagePlus className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
            <span className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
              {pasteTarget === storageKey
                ? "Press Ctrl+V / Cmd+V to paste screenshot, or Upload"
                : "Project Screenshot Slot — Click & press Ctrl+V or Upload"}
            </span>
          </div>
        )}

        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              fileRef.current?.click();
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-neutral-300 bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-neutral-900 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
          >
            <Camera className="h-3 w-3" />
            <span>{imgSrc ? "Replace" : "Upload"}</span>
          </button>
          {imgSrc && (
            <button
              type="button"
              aria-label="Reset screenshot"
              onClick={(e) => {
                e.stopPropagation();
                saveLocalImage(storageKey, null);
              }}
              className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={onInspect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onInspect();
          }
        }}
        className="group cursor-pointer p-5 space-y-3"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-3.5 w-3.5" />
            <span className="text-[10.5px] font-mono text-neutral-500 dark:text-neutral-400">
              {project.year} · {project.status}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-500 group-hover:text-neutral-950 dark:text-neutral-400 dark:group-hover:text-white">
            Inspect <ArrowUpRight className="h-3 w-3" />
          </span>
        </div>

        <div>
          <h3 className="text-base font-bold">{project.title}</h3>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">
            {project.tagline}
          </p>
        </div>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1 pt-1">
          {project.stack.map((tech) => (
            <span
              key={tech}
              className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 text-[10px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
