"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
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
  User,
  X,
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import PulseHeart from "@/components/pulse-heart";
import SlingButton from "@/components/sling-button";
import SocialFlipButton, { type SocialItem } from "@/components/social-flip-button";
import { Reveal } from "@/components/reveal";
import { EditableExperienceList } from "@/components/experience-section";
import { GitHubContributionGraph } from "@/components/github-contributions";
import { ProofGallery } from "@/components/proof-gallery";
import { ProjectsShowcase } from "@/components/projects-showcase";
import { SkillsSection } from "@/components/skills-section";
import { EditableNotesFeed } from "@/components/blog-index-client";
import type { BlogPostMeta } from "@/lib/blog";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";
import {
  compressAndReadImage,
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

interface PortfolioViewProps {
  posts?: BlogPostMeta[];
}

interface CustomProfileState {
  name: string;
  role: string;
  bio: string;
  bioPoints: string[];
  location: string;
  websiteLabel: string;
  websiteHref: string;
  joined: string;
  availability: string;
  email: string;
  github: string;
  twitter: string;
  linkedin: string;
}

const PROFILE_KEY = "tejas_custom_profile";
const LIKES_KEY = "tejas_portfolio_likes";
const DEFAULT_LIKES_JSON = '{"liked":false,"count":0}';

const DEFAULT_PROFILE_STATE: CustomProfileState = {
  name: PORTFOLIO_PROFILE.name,
  role: PORTFOLIO_PROFILE.role,
  bio: PORTFOLIO_PROFILE.bio,
  bioPoints: PORTFOLIO_PROFILE.bioPoints,
  location: PORTFOLIO_PROFILE.location,
  websiteLabel: PORTFOLIO_PROFILE.websiteLabel,
  websiteHref: PORTFOLIO_PROFILE.websiteHref,
  joined: PORTFOLIO_PROFILE.joined,
  availability: "Available for builds",
  email: PORTFOLIO_PROFILE.email,
  github: PORTFOLIO_PROFILE.socials.github,
  twitter: PORTFOLIO_PROFILE.socials.twitter,
  linkedin: PORTFOLIO_PROFILE.socials.linkedin,
};

const INDEX_SECTIONS = [
  { id: "profile", label: "Profile" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "highlights", label: "Proof & Activity" },
  { id: "skills", label: "Skills" },
  { id: "blogs", label: "Blogs" },
  { id: "connect", label: "Connect" },
];

const emptySubscribe = () => () => {};

export function PortfolioView({ posts = [] }: PortfolioViewProps) {
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

  const likesRaw = useLocalValue(LIKES_KEY, DEFAULT_LIKES_JSON);
  const likeState = parseStoredJson<{ liked: boolean; count: number }>(
    likesRaw,
    { liked: false, count: 0 }
  );

  const profileRaw = useLocalValue(PROFILE_KEY, "");
  const storedProfile = profileRaw
    ? parseStoredJson<Partial<CustomProfileState>>(profileRaw, {})
    : null;
  const profile: CustomProfileState = {
    ...DEFAULT_PROFILE_STATE,
    ...(storedProfile ?? {}),
  };

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState<CustomProfileState>(profile);
  const [bioPointsText, setBioPointsText] = useState("");

  const [editingQuote, setEditingQuote] = useState(false);
  const [draftQuote, setDraftQuote] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");

  const aboutText = useLocalValue("tejas_about_me", "");
  const [aboutOpen, setAboutOpen] = useState(false);
  const [editingAbout, setEditingAbout] = useState(false);
  const [aboutDraft, setAboutDraft] = useState("");

  const [senderEmail, setSenderEmail] = useState("");
  const [mailSubject, setMailSubject] = useState("");
  const [mailMessage, setMailMessage] = useState("");
  const [mailSentNotice, setMailSentNotice] = useState(false);

  const bannerSrc = useLocalValue(
    "tejas_portfolio_banner",
    PORTFOLIO_PROFILE.bannerImage
  );
  const avatarSrc = useLocalValue(
    "tejas_portfolio_avatar",
    PORTFOLIO_PROFILE.avatarImage
  );
  const quoteText = useLocalValue(
    "tejas_portfolio_quote",
    PORTFOLIO_PROFILE.quote
  );
  const quoteAuthor = useLocalValue(
    "tejas_portfolio_quote_author",
    PORTFOLIO_PROFILE.quoteAuthor
  );

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const elements = INDEX_SECTIONS.map((s) =>
      document.getElementById(s.id)
    ).filter((el): el is HTMLElement => Boolean(el));
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
    let active = true;
    fetch("/api/likes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { count?: number } | null) => {
        if (!active || !data || typeof data.count !== "number") return;
        const current = parseStoredJson<{ liked: boolean; count: number }>(
          localStorage.getItem(LIKES_KEY) ?? DEFAULT_LIKES_JSON,
          { liked: false, count: 0 }
        );
        const mergedCount = Math.max(
          data.count,
          current.count,
          current.liked ? 1 : 0
        );
        if (mergedCount !== current.count) {
          writeLocalValue(
            LIKES_KEY,
            JSON.stringify({ liked: current.liked, count: mergedCount })
          );
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
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
            const opts =
              pasteTarget === "tejas_portfolio_avatar"
                ? { maxWidth: 512, maxHeight: 512, quality: 0.85 }
                : { maxWidth: 1400, maxHeight: 500, quality: 0.84 };
            compressAndReadImage(
              file,
              (dataUrl) => {
                writeLocalValue(pasteTarget, dataUrl);
                setPasteTarget(null);
              },
              opts
            );
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
    navigator.clipboard.writeText(profile.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleSendEmail = () => {
    const subject = mailSubject.trim() || "Hello Tejas — Project Inquiry";
    const bodyLines = [
      senderEmail.trim() ? `From: ${senderEmail.trim()}` : "",
      mailMessage.trim() || "Hi Tejas, I'd love to connect about...",
    ].filter(Boolean);
    const mailtoUrl = `mailto:${profile.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(bodyLines.join("\n\n"))}`;
    window.location.href = mailtoUrl;
    setMailSentNotice(true);
    setTimeout(() => setMailSentNotice(false), 3500);
  };

  const openProfileEditor = () => {
    setProfileDraft(profile);
    setBioPointsText(profile.bioPoints.join("\n"));
    setEditingProfile(true);
  };

  const saveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const points = bioPointsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const next: CustomProfileState = {
      ...profileDraft,
      name: profileDraft.name.trim() || DEFAULT_PROFILE_STATE.name,
      role: profileDraft.role.trim() || DEFAULT_PROFILE_STATE.role,
      bio: profileDraft.bio.trim() || DEFAULT_PROFILE_STATE.bio,
      bioPoints: points.length > 0 ? points : DEFAULT_PROFILE_STATE.bioPoints,
    };
    writeLocalValue(PROFILE_KEY, JSON.stringify(next));
    setEditingProfile(false);
  };

  const socialItems: SocialItem[] = [
    { letter: "G", icon: <FaGithub />, label: "GitHub", href: profile.github },
    {
      letter: "X",
      icon: <FaTwitter />,
      label: "X / Twitter",
      href: profile.twitter,
    },
    {
      letter: "L",
      icon: <FaLinkedin />,
      label: "LinkedIn",
      href: profile.linkedin,
    },
    {
      letter: "M",
      icon: <FaEnvelope />,
      label: `Email ${profile.name}`,
      href: `mailto:${profile.email}`,
    },
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
          if (file) {
            compressAndReadImage(
              file,
              (url) => writeLocalValue("tejas_portfolio_banner", url),
              { maxWidth: 1400, maxHeight: 500, quality: 0.84 }
            );
          }
          e.target.value = "";
        }}
      />
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            compressAndReadImage(
              file,
              (url) => writeLocalValue("tejas_portfolio_avatar", url),
              { maxWidth: 512, maxHeight: 512, quality: 0.85 }
            );
          }
          e.target.value = "";
        }}
      />

      <div className="mx-auto flex max-w-[1040px] justify-center gap-8 px-3 sm:px-5">
        <main className="w-full max-w-[780px]">
          <header className="sticky top-0 z-40 flex h-11 items-center justify-between gap-3 bg-[#FAFAFA]/90 px-4 sm:px-5 backdrop-blur-md dark:bg-[#0A0A0A]/90">
            <button
              type="button"
              onClick={() => {
                if (!aboutOpen) {
                  setAboutOpen(true);
                  if (!aboutText) {
                    setAboutDraft("");
                    setEditingAbout(true);
                  }
                  document
                    .getElementById("profile")
                    ?.scrollIntoView({ behavior: "smooth" });
                } else {
                  setAboutOpen(false);
                  setEditingAbout(false);
                }
              }}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium tracking-tight transition-colors ${
                aboutOpen
                  ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
                  : "text-neutral-800 hover:bg-neutral-200/70 dark:text-neutral-200 dark:hover:bg-neutral-800/70"
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>About Me</span>
            </button>

            <div className="flex items-center gap-2">
              <PulseHeart
                count={likeState.count}
                liked={likeState.liked}
                onChange={(nextLiked, nextCount) => {
                  writeLocalValue(
                    LIKES_KEY,
                    JSON.stringify({ liked: nextLiked, count: nextCount })
                  );
                  fetch("/api/likes", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ delta: nextLiked ? 1 : -1 }),
                  })
                    .then((res) => (res.ok ? res.json() : null))
                    .then((data: { count?: number } | null) => {
                      if (data && typeof data.count === "number") {
                        writeLocalValue(
                          LIKES_KEY,
                          JSON.stringify({
                            liked: nextLiked,
                            count: Math.max(nextLiked ? 1 : 0, data.count),
                          })
                        );
                      }
                    })
                    .catch(() => {});
                }}
                showCount
                icon="heart"
                idleOutline
                size={18}
                corner={999}
                likedColor="#ff4d6d"
                idleColor={isDark ? "#a1a1aa" : "#52525b"}
                pillColor={isDark ? "#18181b" : "#f4f4f5"}
                textColor={isDark ? "#fafafa" : "#09090b"}
              />
              <ThemeToggle />
            </div>
          </header>

          <section
            id="profile"
            className="pb-6"
          >
            <div
              tabIndex={0}
              onClick={() => setPasteTarget("tejas_portfolio_banner")}
              onFocus={() => setPasteTarget("tejas_portfolio_banner")}
              className="group relative h-32 sm:h-36 w-full overflow-hidden rounded-2xl bg-neutral-100 outline-none dark:bg-neutral-900/50"
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
                  className="flex h-full w-full flex-col items-center justify-center gap-1.5 px-4 pb-3 sm:pb-1 text-center"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(120,120,120,0.18) 1px, transparent 0)",
                    backgroundSize: "16px 16px",
                  }}
                >
                  <p className="text-xs sm:text-[14.5px] font-medium leading-snug sm:leading-relaxed text-neutral-900 dark:text-neutral-100">
                    श्रीगुरु चरन सरोज रज, निज मनु मुकुरु सुधारि।
                    <br />
                    बरनउँ रघुबर बिमल जसु, जो दायकु फल चारि॥
                  </p>
                  <span
                    aria-hidden="true"
                    className="h-px w-12 bg-neutral-300 dark:bg-neutral-700"
                  />
                  <p className="text-xs sm:text-[14.5px] font-medium leading-snug sm:leading-relaxed text-neutral-700 dark:text-neutral-300">
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
                  className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-neutral-200 bg-white/90 px-2.5 py-1 text-[10.5px] font-medium text-neutral-900 backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
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
                      writeLocalValue("tejas_portfolio_banner", null);
                    }}
                    className="inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg border border-neutral-200 bg-white/90 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 sm:px-7 pb-8">
              <div className="flex items-end justify-between gap-3">
                <div className="relative -mt-10 sm:-mt-12">
                  <div
                    tabIndex={0}
                    onClick={() => setPasteTarget("tejas_portfolio_avatar")}
                    onFocus={() => setPasteTarget("tejas_portfolio_avatar")}
                    title="Click and press Ctrl+V or click camera to upload photo"
                    className="group relative flex h-20 w-20 sm:h-24 sm:w-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-[#FAFAFA] bg-neutral-200 dark:border-[#0A0A0A] dark:bg-neutral-900"
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
                        <span className="text-lg font-semibold tracking-tight">
                          {profile.name.slice(0, 1).toUpperCase()}
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400">
                          {pasteTarget === "tejas_portfolio_avatar"
                            ? "Ctrl+V"
                            : "PHOTO"}
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
                      className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <Camera className="h-4 w-4" />
                    </button>
                  </div>

                  {avatarSrc && (
                    <button
                      type="button"
                      aria-label="Remove profile photo"
                      onClick={() =>
                        writeLocalValue("tejas_portfolio_avatar", null)
                      }
                      className="absolute -right-1 bottom-0 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={openProfileEditor}
                    className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-lg border border-neutral-200 px-2.5 text-[11px] font-mono text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-950 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={copyEmail}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200 px-3 text-xs font-medium text-neutral-800 transition-colors hover:border-neutral-400 dark:border-neutral-800 dark:text-neutral-200 dark:hover:border-neutral-600"
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
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1 rounded-lg bg-neutral-950 px-3.5 text-xs font-medium text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-neutral-950"
                  >
                    <span>Follow</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {editingProfile ? (
                <form
                  onSubmit={saveProfileEdit}
                  className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 sm:p-5 space-y-3 dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-mono text-neutral-500">
                      Edit Profile
                    </p>
                    <div className="flex items-center gap-2">
                      {storedProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            writeLocalValue(PROFILE_KEY, null);
                            setEditingProfile(false);
                          }}
                          className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-500 hover:text-neutral-950 dark:hover:text-white"
                        >
                          <RotateCcw className="h-3 w-3" /> Reset
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingProfile(false)}
                        className="cursor-pointer p-1 text-neutral-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <input
                      type="text"
                      value={profileDraft.name}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, name: e.target.value })
                      }
                      placeholder="Display Name"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.role}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, role: e.target.value })
                      }
                      placeholder="Role"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.bio}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, bio: e.target.value })
                      }
                      placeholder="Bio Lead"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.availability}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          availability: e.target.value,
                        })
                      }
                      placeholder="Status"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.location}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          location: e.target.value,
                        })
                      }
                      placeholder="Location"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.joined}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          joined: e.target.value,
                        })
                      }
                      placeholder="Joined"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.websiteLabel}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          websiteLabel: e.target.value,
                        })
                      }
                      placeholder="Website label"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.websiteHref}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          websiteHref: e.target.value,
                        })
                      }
                      placeholder="Website URL"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="email"
                      value={profileDraft.email}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          email: e.target.value,
                        })
                      }
                      placeholder="Contact Email"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="url"
                      value={profileDraft.github}
                      onChange={(e) =>
                        setProfileDraft({
                          ...profileDraft,
                          github: e.target.value,
                        })
                      }
                      placeholder="GitHub URL"
                      className="h-9 rounded-lg border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={bioPointsText}
                    onChange={(e) => setBioPointsText(e.target.value)}
                    placeholder="Bio bullets (one per line)"
                    className="w-full rounded-lg border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                    >
                      Save
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-3">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-semibold tracking-[-0.02em]">
                      {profile.name}
                    </h1>
                    <p className="mt-0.5 text-xs font-mono text-neutral-500 dark:text-neutral-400">
                      {profile.role}
                    </p>
                  </div>

                  <div className="space-y-1.5 text-[13.5px] sm:text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-2xl">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {profile.bio}
                    </p>
                    <ul className="space-y-1">
                      {profile.bioPoints.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500"
                          />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.location}
                    </span>
                    <a
                      href={profile.websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-neutral-800 hover:underline dark:text-neutral-200"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {profile.websiteLabel}
                    </a>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {profile.joined}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {profile.availability}
                    </span>
                  </div>

                  {aboutOpen && (
                    <div className="mt-4 rounded-xl bg-neutral-100/70 p-4 sm:p-5 space-y-3 dark:bg-neutral-900/50">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-medium tracking-tight text-neutral-950 dark:text-neutral-50">
                          About Me
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono">
                          {!editingAbout && (
                            <button
                              type="button"
                              onClick={() => {
                                setAboutDraft(aboutText);
                                setEditingAbout(true);
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                            >
                              <Pencil className="h-3 w-3" />
                              <span>Edit</span>
                            </button>
                          )}
                          {aboutText && (
                            <button
                              type="button"
                              onClick={() => {
                                writeLocalValue("tejas_about_me", null);
                                setAboutDraft("");
                                setEditingAbout(false);
                              }}
                              className="inline-flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                            >
                              <RotateCcw className="h-3 w-3" />
                              <span>Clear</span>
                            </button>
                          )}
                          <button
                            type="button"
                            aria-label="Close About Me"
                            onClick={() => {
                              setAboutOpen(false);
                              setEditingAbout(false);
                            }}
                            className="cursor-pointer p-0.5 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {editingAbout ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            writeLocalValue(
                              "tejas_about_me",
                              aboutDraft.trim() || null
                            );
                            setEditingAbout(false);
                          }}
                          className="space-y-2.5"
                        >
                          <textarea
                            rows={4}
                            value={aboutDraft}
                            onChange={(e) => setAboutDraft(e.target.value)}
                            placeholder="Write about yourself — your story, what drives you, what you're exploring..."
                            className="w-full rounded-lg bg-[#FAFAFA] p-3 text-[13.5px] leading-relaxed outline-none focus:ring-1 focus:ring-neutral-400 dark:bg-[#0A0A0A] dark:focus:ring-neutral-600"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditingAbout(false)}
                              className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1 text-xs dark:border-neutral-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        <p className="whitespace-pre-wrap text-[13.5px] sm:text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                          {aboutText ||
                            "Nothing written yet. Click Edit to write about yourself."}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          <section
            id="experience"
            className="px-5 sm:px-7 py-10 sm:py-12"
          >
            <Reveal>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                  Experience
                </h2>
                <Link
                  href="/experience"
                  className="text-xs font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                >
                  View All →
                </Link>
              </div>
            </Reveal>

            <EditableExperienceList maxItems={2} />
          </section>

          <section
            id="projects"
            className="px-5 sm:px-7 py-10 sm:py-12"
          >
            <Reveal>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                  Projects
                </h2>
                <Link
                  href="/projects"
                  className="text-xs font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                >
                  View All →
                </Link>
              </div>
            </Reveal>

            <ProjectsShowcase
              defaultUsername={PORTFOLIO_PROFILE.githubUsername}
              basePath=""
              maxMain={3}
              showGithubMore={false}
            />
          </section>

          <section
            id="highlights"
            className="px-5 sm:px-7 py-10 sm:py-12 space-y-5"
          >
            <Reveal>
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                  Proof &amp; Activity
                </h2>
                <Link
                  href="/highlights"
                  className="text-xs font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                >
                  View All →
                </Link>
              </div>
            </Reveal>

            <Reveal>
              <ProofGallery compact />
            </Reveal>

            <Reveal>
              <GitHubContributionGraph
                defaultUsername={PORTFOLIO_PROFILE.githubUsername}
              />
            </Reveal>
          </section>

          <SkillsSection />

          <section
            id="blogs"
            className="px-5 sm:px-7 py-10 sm:py-12"
          >
            <Reveal>
              <div className="mb-5 flex items-baseline justify-between gap-4">
                <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                  Blogs
                </h2>
                <Link
                  href="/blog"
                  className="text-xs font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                >
                  View All →
                </Link>
              </div>
            </Reveal>

            <EditableNotesFeed initialPosts={posts} basePath="" maxItems={2} />
          </section>

          <section
            id="connect"
            className="px-5 sm:px-7 py-10 sm:py-12 space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-5 space-y-3">
                <h2 className="text-lg sm:text-xl font-semibold tracking-[-0.02em]">
                  Get in touch
                </h2>
                <p className="text-[13.5px] text-neutral-500 dark:text-neutral-400 leading-relaxed">
                  Reach out directly at{" "}
                  <span className="font-mono text-neutral-900 dark:text-neutral-100">
                    {profile.email}
                  </span>
                  .
                </p>

                <div className="pt-2">
                  <SocialFlipButton items={socialItems} />
                </div>
              </div>

              <div className="md:col-span-7 rounded-xl bg-neutral-100/60 p-4 sm:p-5 space-y-3 dark:bg-neutral-900/45">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="Your email"
                    className="h-9 w-full rounded-lg bg-[#FAFAFA] px-3 text-xs outline-none transition-colors focus:ring-1 focus:ring-neutral-400 dark:bg-[#0A0A0A] dark:focus:ring-neutral-600"
                  />
                  <input
                    type="text"
                    value={mailSubject}
                    onChange={(e) => setMailSubject(e.target.value)}
                    placeholder="Subject"
                    className="h-9 w-full rounded-lg bg-[#FAFAFA] px-3 text-xs outline-none transition-colors focus:ring-1 focus:ring-neutral-400 dark:bg-[#0A0A0A] dark:focus:ring-neutral-600"
                  />
                </div>

                <textarea
                  rows={3}
                  value={mailMessage}
                  onChange={(e) => setMailMessage(e.target.value)}
                  placeholder={`Message to ${profile.name}…`}
                  className="w-full rounded-lg bg-[#FAFAFA] p-3 text-xs outline-none transition-colors focus:ring-1 focus:ring-neutral-400 dark:bg-[#0A0A0A] dark:focus:ring-neutral-600"
                />

                <div className="flex items-center justify-between gap-4 pt-1">
                  <div className="text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
                    {mailSentNotice ? (
                      <span className="inline-flex items-center gap-1 text-neutral-900 dark:text-white font-medium">
                        <Check className="h-3.5 w-3.5" /> Opened mail client
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
                    size={46}
                    strokeWidth={3}
                    armAt={40}
                    maxPull={130}
                    launchSpeed={2600}
                    recoil={0.2}
                    flight={110}
                    particles={14}
                    spread={60}
                    axis="any"
                    tapSends
                    ariaLabel={`Send email to ${profile.name}`}
                  />
                </div>
              </div>
            </div>

            <div className="group border-t border-neutral-200/80 pt-12 pb-8 sm:pt-16 sm:pb-12 dark:border-neutral-800/80">
              {editingQuote ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    writeLocalValue(
                      "tejas_portfolio_quote",
                      draftQuote.trim() || null
                    );
                    writeLocalValue(
                      "tejas_portfolio_quote_author",
                      draftAuthor.trim() || null
                    );
                    setEditingQuote(false);
                  }}
                  className="space-y-3 max-w-xl"
                >
                  <textarea
                    rows={3}
                    value={draftQuote}
                    onChange={(e) => setDraftQuote(e.target.value)}
                    placeholder="Write a quote..."
                    className="w-full rounded-lg border border-neutral-200 bg-transparent p-3 text-sm outline-none focus:border-neutral-950 dark:border-neutral-800 dark:focus:border-white"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <input
                      type="text"
                      value={draftAuthor}
                      onChange={(e) => setDraftAuthor(e.target.value)}
                      placeholder="Author"
                      className="h-8 w-48 rounded-lg border border-neutral-200 bg-transparent px-3 text-xs font-mono outline-none focus:border-neutral-950 dark:border-neutral-800 dark:focus:border-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingQuote(false)}
                        className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1 text-xs dark:border-neutral-800"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="cursor-pointer rounded-lg bg-neutral-950 px-3.5 py-1 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <blockquote className="max-w-2xl text-base sm:text-xl font-normal tracking-tight leading-relaxed text-neutral-800 dark:text-neutral-200">
                    &ldquo;{quoteText}&rdquo;
                  </blockquote>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                      — {quoteAuthor}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDraftQuote(quoteText);
                        setDraftAuthor(quoteAuthor);
                        setEditingQuote(true);
                      }}
                      className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-400 opacity-60 transition-opacity hover:text-neutral-950 group-hover:opacity-100 dark:hover:text-white"
                    >
                      <Pencil className="h-3 w-3" />
                      <span>Edit quote</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-neutral-200/80 pt-6 text-xs text-neutral-400 dark:border-neutral-800/80 dark:text-neutral-500">
              <span>
                &copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}
              </span>
            </div>
          </section>
        </main>

        <aside className="hidden lg:block w-40 shrink-0 pt-10">
          <div className="sticky top-18 space-y-2.5 pl-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.12em] text-neutral-400 dark:text-neutral-500">
              Index
            </p>
            <nav aria-label="Section index" className="flex flex-col gap-1.5">
              {INDEX_SECTIONS.map((sec) => {
                const isActive = activeSection === sec.id;
                return (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    className={`group flex items-center gap-2 py-0.5 text-xs transition-colors ${
                      isActive
                        ? "font-medium text-neutral-950 dark:text-white"
                        : "text-neutral-400 hover:text-neutral-900 dark:text-neutral-500 dark:hover:text-neutral-200"
                    }`}
                  >
                    <span
                      className={`h-px transition-all ${
                        isActive
                          ? "w-3.5 bg-neutral-950 dark:bg-white"
                          : "w-1.5 bg-neutral-300 group-hover:w-2.5 dark:bg-neutral-700"
                      }`}
                    />
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
