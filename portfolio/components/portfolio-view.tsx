"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
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
  X,
} from "lucide-react";
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import { CreepyButton } from "@/components/creepy-button";
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
  { id: "profile", num: "00", label: "Profile" },
  { id: "experience", num: "01", label: "Experience" },
  { id: "projects", num: "02", label: "Projects" },
  { id: "highlights", num: "03", label: "Proof & Activity" },
  { id: "skills", num: "04", label: "Skills" },
  { id: "blogs", num: "05", label: "Blogs" },
  { id: "connect", num: "06", label: "Connect" },
];

const emptySubscribe = () => () => {};

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

  // Persistent Like counter
  const likesRaw = useLocalValue(LIKES_KEY, DEFAULT_LIKES_JSON);
  const likeState = parseStoredJson<{ liked: boolean; count: number }>(
    likesRaw,
    { liked: false, count: 0 }
  );

  // Persistent Profile / Socials
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

  // Persistent Bottom Quote
  const [editingQuote, setEditingQuote] = useState(false);
  const [draftQuote, setDraftQuote] = useState("");
  const [draftAuthor, setDraftAuthor] = useState("");

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

      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-[#FAFAFA]/85 backdrop-blur-xl dark:border-neutral-800 dark:bg-[#0A0A0A]/85">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-3 px-4">
          <a href="#profile" className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-950 text-[11px] font-black text-white dark:bg-white dark:text-neutral-950">
              {profile.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="text-xs sm:text-sm font-bold tracking-tight">
              {profile.name}
              <span className="font-normal text-neutral-500 dark:text-neutral-400">
                {" "}
                | Developer
              </span>
            </span>
          </a>

          <div className="flex items-center gap-2.5">
            <PulseHeart
              count={likeState.count}
              liked={likeState.liked}
              onChange={(nextLiked, nextCount) =>
                writeLocalValue(
                  LIKES_KEY,
                  JSON.stringify({ liked: nextLiked, count: nextCount })
                )
              }
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
                      writeLocalValue("tejas_portfolio_banner", null);
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
                        <span className="text-xl font-black tracking-tight">
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
                      className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
                      className="absolute -right-1 bottom-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-900 shadow-sm dark:border-neutral-700 dark:bg-neutral-950 dark:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <button
                    type="button"
                    onClick={openProfileEditor}
                    className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 text-[11px] font-mono text-neutral-700 transition-colors hover:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-white"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>

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
                    href={profile.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center gap-1 rounded-full bg-neutral-950 px-4 text-xs font-semibold text-white transition-opacity hover:opacity-85 dark:bg-white dark:text-neutral-950"
                  >
                    <span>Follow</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>

              {editingProfile ? (
                <form
                  onSubmit={saveProfileEdit}
                  className="mt-5 rounded-2xl border border-neutral-300 bg-white p-5 space-y-3 dark:border-neutral-700 dark:bg-neutral-950"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                      Edit Profile &amp; Links
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
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={profileDraft.name}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, name: e.target.value })
                      }
                      placeholder="Display Name"
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.role}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, role: e.target.value })
                      }
                      placeholder="Role (e.g. Engineer / Gamer)"
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                    <input
                      type="text"
                      value={profileDraft.bio}
                      onChange={(e) =>
                        setProfileDraft({ ...profileDraft, bio: e.target.value })
                      }
                      placeholder="Bio Lead"
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      placeholder="Status (e.g. Available for builds)"
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      placeholder="Joined badge"
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
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
                      className="h-9 rounded-xl border border-neutral-200 bg-[#FAFAFA] px-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                    />
                  </div>

                  <textarea
                    rows={3}
                    value={bioPointsText}
                    onChange={(e) => setBioPointsText(e.target.value)}
                    placeholder="Bio bullets (one per line)"
                    className="w-full rounded-xl border border-neutral-200 bg-[#FAFAFA] p-3 text-xs outline-none dark:border-neutral-800 dark:bg-[#0A0A0A]"
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="cursor-pointer rounded-full border border-neutral-300 px-3.5 py-1.5 text-xs dark:border-neutral-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="cursor-pointer rounded-full bg-neutral-950 px-4 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-neutral-950"
                    >
                      Save Profile
                    </button>
                  </div>
                </form>
              ) : (
                <div className="mt-4 space-y-3.5">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {profile.name}
                    </h1>
                    <p className="mt-0.5 text-xs sm:text-sm font-mono text-neutral-500 dark:text-neutral-400">
                      {profile.role}
                    </p>
                  </div>

                  <div className="space-y-2 text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed max-w-2xl">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {profile.bio}
                    </p>
                    <ul className="space-y-1.5">
                      {profile.bioPoints.map((point) => (
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
                      {profile.location}
                    </span>
                    <a
                      href={profile.websiteHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-medium text-neutral-900 hover:underline dark:text-white"
                    >
                      <Link2 className="h-3.5 w-3.5" />
                      {profile.websiteLabel}
                    </a>
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {profile.joined}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-neutral-600 dark:text-neutral-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-neutral-950 dark:bg-white" />
                      {profile.availability}
                    </span>
                  </div>
                </div>
              )}
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
                    Engineering &amp; Startup Journey
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

            <EditableExperienceList maxItems={2} />
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
                    Main Live Projects
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

            <ProjectsShowcase
              defaultUsername={PORTFOLIO_PROFILE.githubUsername}
              basePath=""
              maxMain={2}
              showGithubMore={false}
            />
          </section>

          <section
            id="highlights"
            className="border-b border-neutral-200 px-5 sm:px-8 py-14 sm:py-16 dark:border-neutral-800 space-y-8"
          >
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-mono uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-400">
                    03 / Proof &amp; Activity
                  </p>
                  <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight">
                    Proof Gallery &amp; GitHub Activity
                  </h2>
                </div>
                <CreepyButton
                  type="button"
                  onClick={() => router.push("/highlights")}
                >
                  View All →
                </CreepyButton>
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
                    Markdown notes saved in <code className="font-mono">content/blog/</code> or quick browser notes.
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

            <EditableNotesFeed initialPosts={posts} basePath="" maxItems={2} />
          </section>

          <section
            id="connect"
            className="px-5 sm:px-8 py-14 sm:py-16 space-y-10"
          >
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
                    {profile.email}
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
                    placeholder={`Write your message to ${profile.name}…`}
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
                    ariaLabel={`Send email to ${profile.name}`}
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
              <span>
                &copy; {new Date().getFullYear()} {PORTFOLIO_PROFILE.handle}
              </span>
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
