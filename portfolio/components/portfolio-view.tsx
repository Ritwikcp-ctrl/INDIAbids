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
  ArrowUpRight,
  Calendar,
  Camera,
  Check,
  Copy,
  Link2,
  Mail,
  MapPin,
  Pencil,
  RotateCcw,
  Sparkles,
  Terminal,
  X,
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreepyButton } from "@/components/creepy-button";
import PulseHeart from "@/components/pulse-heart";
import SlingButton from "@/components/sling-button";
import SocialFlipButton, { type SocialItem } from "@/components/social-flip-button";
import { Reveal } from "@/components/reveal";
import { GitHubContributionGraph } from "@/components/github-contributions";
import { GitHubPinnedProjects } from "@/components/github-pinned-projects";
import { SkillsSection } from "@/components/skills-section";
import { BlogFeedCard } from "@/components/blog-index-client";
import type { BlogPostMeta } from "@/lib/blog";
import {
  EXPERIENCE_ITEMS,
  HIGHLIGHTS,
  PORTFOLIO_PROFILE,
} from "@/lib/portfolio-data";

interface PortfolioViewProps {
  posts?: BlogPostMeta[];
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
    // Ignore quota errors
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

export function PortfolioView({ posts = [] }: PortfolioViewProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const isDark = !mounted || resolvedTheme === "dark";

  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [pasteTarget, setPasteTarget] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [editingQuote, setEditingQuote] = useState(false);
  const [draftQuote, setDraftQuote] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");

  const [senderEmail, setSenderEmail] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [mailSentNotice, setMailSentNotice] = useState(false);

  const bannerSrc = useStoredImage("tejas_portfolio_banner", PORTFOLIO_PROFILE.bannerImage);
  const avatarSrc = useStoredImage("tejas_portfolio_avatar", PORTFOLIO_PROFILE.avatarImage);
  const quoteText = useStoredImage("tejas_portfolio_quote", PORTFOLIO_PROFILE.quote);
  const quoteAuthor = useStoredImage("tejas_portfolio_quote_author", PORTFOLIO_PROFILE.quoteAuthor);

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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#0A0A0A] dark:bg-[#0A0A0A] dark:text-[#FAFAFA] transition-colors duration-200 selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900">
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

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#FAFAFA]/85 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0A0A0A]/85">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4">
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
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1200px] justify-center gap-8 px-3 sm:px-5">
        <main className="w-full max-w-[940px] border-x border-neutral-200 dark:border-neutral-800">
          <section
            id="profile"
            className="border-b border-neutral-200 dark:border-neutral-800"
          >
            <div
              tabIndex={0}
              onClick={() => setPasteTarget("tejas_portfolio_banner")}
              onFocus={() => setPasteTarget("tejas_portfolio_banner")}
              className="group relative h-36 sm:h-40 w-full overflow-hidden border-b border-neutral-200 bg-neutral-100 outline-none dark:border-neutral-800 dark:bg-neutral-900/70"
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
                  lang="hi"
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 pb-4 sm:pb-2 text-center"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(120,120,120,0.22) 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <p className="text-xs sm:text-[15px] font-semibold leading-snug sm:leading-relaxed text-neutral-900 dark:text-neutral-100">
                    श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।
                    <br />
                    बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥
                  </p>
                  <span
                    aria-hidden="true"
                    className="h-px w-14 bg-neutral-300 dark:bg-neutral-700"
                  />
                  <p className="text-xs sm:text-[15px] font-semibold leading-snug sm:leading-relaxed text-neutral-800 dark:text-neutral-200">
                    बुद्धिहीन तनु जानिके, सुमिरौं पवन-कुमार।
                    <br />
                    बल बुद्धि बिद्या देहु मोहिं, हरहु कलेस बिकार॥
                  </p>
                </div>
              )}

              <div className="absolute right-3 bottom-3 flex items-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
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
                        className="h-full w-full object-cover"
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
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {PORTFOLIO_PROFILE.name}
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400">
                    {PORTFOLIO_PROFILE.role}
                  </p>
                </div>

                <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {PORTFOLIO_PROFILE.bio}
                  </p>
                  <ul className="space-y-1.5">
                    {PORTFOLIO_PROFILE.bioPoints.map((point) => (
                      <li key={point} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500"
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {PORTFOLIO_PROFILE.location}
                  </span>
                  <a
                    href={PORTFOLIO_PROFILE.websiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-neutral-900 hover:underline dark:text-white"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    {PORTFOLIO_PROFILE.websiteLabel}
                  </a>
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
                  <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 dark:bg-white" />
                    Available for builds
                  </span>
                </div>
              </div>
            </div>
          </section>

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
                  onClick={() => router.push("/experience")}
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

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {exp.stack.map((tech) => (
                          <span
                            key={tech}
                            className="rounded border border-neutral-200 bg-neutral-100 px-2 py-0.5 text-[10.5px] font-mono text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
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
                    GitHub Pinned Projects
                  </h2>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push("/projects")}
                >
                  View All →
                </CreepyButton>
              </div>
            </Reveal>

            <GitHubPinnedProjects
              defaultUsername={PORTFOLIO_PROFILE.githubUsername}
              basePath=""
              maxItems={2}
            />
          </section>

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

          <SkillsSection />

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
                    Daily Notes &amp; Engineering Journal
                  </h2>
                  <p className="mt-1 text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
                    Markdown notes saved in <code className="font-mono">content/blog/</code> for public reading anytime.
                  </p>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push("/blog")}
                >
                  View All →
                </CreepyButton>
              </div>
            </Reveal>

            <div className="space-y-4">
              {posts.slice(0, 2).map((post, idx) => (
                <Reveal key={post.slug} delay={idx * 0.04}>
                  <BlogFeedCard post={post} basePath="" />
                </Reveal>
              ))}
            </div>
          </section>

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
                  <SocialFlipButton items={socialItems} />
                </div>
              </div>

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

            {/* Spacious Bottom Quote Space */}
            <div className="border-t border-neutral-200 pt-14 pb-12 sm:pt-20 sm:pb-16 dark:border-neutral-800">
              <div className="rounded-2xl border border-dashed border-neutral-300 bg-white/60 px-6 py-10 sm:px-10 sm:py-14 dark:border-neutral-800 dark:bg-neutral-950/60">
                {editingQuote ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveLocalImage("tejas_portfolio_quote", draftQuote.trim() || null);
                      saveLocalImage("tejas_portfolio_quote_author", draftAuthor.trim() || null);
                      setEditingQuote(false);
                    }}
                    className="space-y-4 max-w-2xl"
                  >
                    <p className="text-[10.5px] font-mono uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                      Edit Personal Quote
                    </p>
                    <textarea
                      rows={3}
                      value={draftQuote}
                      onChange={(e) => setDraftQuote(e.target.value)}
                      placeholder="Write a quote..."
                      className="w-full rounded-xl border border-neutral-300 bg-[#FAFAFA] p-3.5 text-sm sm:text-base outline-none focus:border-neutral-950 dark:border-neutral-700 dark:bg-[#0A0A0A] dark:focus:border-white"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <input
                        type="text"
                        value={draftAuthor}
                        onChange={(e) => setDraftAuthor(e.target.value)}
                        placeholder="Attribution (e.g. Tejas)"
                        className="h-9 w-56 rounded-xl border border-neutral-300 bg-[#FAFAFA] px-3 text-xs font-mono outline-none focus:border-neutral-950 dark:border-neutral-700 dark:bg-[#0A0A0A] dark:focus:border-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingQuote(false)}
                          className="cursor-pointer rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs font-medium dark:border-neutral-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="cursor-pointer rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                        >
                          Save Quote
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col justify-between gap-6">
                    <blockquote className="max-w-2xl text-lg sm:text-2xl font-medium tracking-tight leading-relaxed text-neutral-900 dark:text-neutral-100">
                      &ldquo;{quoteText}&rdquo;
                    </blockquote>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                        — {quoteAuthor}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setDraftQuote(quoteText);
                          setDraftAuthor(quoteAuthor);
                          setEditingQuote(true);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono text-neutral-600 transition-colors hover:border-neutral-900 hover:text-neutral-950 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-400 dark:hover:border-white dark:hover:text-white"
                      >
                        <Pencil className="h-3 w-3" />
                        <span>Write Quote</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-neutral-200 pt-6 text-xs text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <span>&copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}</span>
            </div>
          </section>
        </main>

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
    </div>
  );
}
