"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  Link2,
  Mail,
  MapPin,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { ThemeToggle } from "@/components/theme-toggle";
import { Reveal } from "@/components/ui/reveal";
import { PORTFOLIO_PROFILE } from "@/lib/portfolio-data";
import {
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

const ABOUT_KEY = "tejas_about_me";
const PROFILE_KEY = "tejas_custom_profile";

interface StoredProfileSubset {
  name?: string;
  role?: string;
  bio?: string;
  bioPoints?: string[];
  location?: string;
  websiteLabel?: string;
  websiteHref?: string;
  joined?: string;
  email?: string;
  github?: string;
}

export default function TejasAboutPage() {
  const avatarSrc = useLocalValue(
    "tejas_portfolio_avatar",
    PORTFOLIO_PROFILE.avatarImage
  );
  const profileRaw = useLocalValue(PROFILE_KEY, "");
  const storedProfile = profileRaw
    ? parseStoredJson<StoredProfileSubset>(profileRaw, {})
    : {};

  const name = storedProfile.name ?? PORTFOLIO_PROFILE.name;
  const role = storedProfile.role ?? PORTFOLIO_PROFILE.role;
  const bio = storedProfile.bio ?? PORTFOLIO_PROFILE.bio;
  const bioPoints = storedProfile.bioPoints ?? PORTFOLIO_PROFILE.bioPoints;
  const location = storedProfile.location ?? PORTFOLIO_PROFILE.location;
  const websiteLabel =
    storedProfile.websiteLabel ?? PORTFOLIO_PROFILE.websiteLabel;
  const websiteHref =
    storedProfile.websiteHref ?? PORTFOLIO_PROFILE.websiteHref;
  const joined = storedProfile.joined ?? PORTFOLIO_PROFILE.joined;
  const email = storedProfile.email ?? PORTFOLIO_PROFILE.email;
  const github = storedProfile.github ?? PORTFOLIO_PROFILE.socials.github;

  const aboutText = useLocalValue(ABOUT_KEY, "");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-950 dark:bg-[#0A0A0A] dark:text-neutral-50 transition-colors">
      <header className="sticky top-0 z-40 bg-[#FAFAFA]/90 backdrop-blur-md dark:bg-[#0A0A0A]/90">
        <div className="mx-auto flex h-12 max-w-[780px] items-center justify-between px-5 sm:px-7">
          <Link
            href="/tejas"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to {name}</span>
          </Link>

          <div className="flex items-center gap-2.5">
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-400 dark:text-neutral-500">
              About Me
            </span>
            <ThemeToggle compact monochrome />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[780px] px-5 sm:px-7 py-10 sm:py-12 space-y-10">
        <Reveal>
          <section className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-900">
              {avatarSrc ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={avatarSrc}
                  alt={name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold tracking-tight">
                  {name.slice(0, 1).toUpperCase()}
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-[28px] font-semibold tracking-[-0.02em]">
                {name}
              </h1>
              <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {role}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {location}
                </span>
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-1 font-medium text-neutral-800 hover:underline dark:text-neutral-200"
                >
                  <Mail className="h-3.5 w-3.5" />
                  {email}
                </a>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="rounded-xl bg-neutral-100/65 p-5 sm:p-6 space-y-4 dark:bg-neutral-900/45">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                About Me
              </h2>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                {aboutText && !editing && (
                  <button
                    type="button"
                    onClick={() => writeLocalValue(ABOUT_KEY, null)}
                    className="inline-flex cursor-pointer items-center gap-1 text-neutral-400 hover:text-neutral-950 dark:hover:text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear</span>
                  </button>
                )}
                {!editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(aboutText);
                      setEditing(true);
                    }}
                    className="inline-flex cursor-pointer items-center gap-1 text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                  >
                    <Pencil className="h-3 w-3" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  writeLocalValue(ABOUT_KEY, draft.trim() || null);
                  setEditing(false);
                }}
                className="space-y-3"
              >
                <textarea
                  rows={6}
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Write about yourself — background, philosophy, what you are building, and goals..."
                  className="w-full rounded-lg bg-[#FAFAFA] p-3.5 text-[13.5px] sm:text-sm leading-relaxed outline-none focus:ring-1 focus:ring-neutral-400 dark:bg-[#0A0A0A] dark:focus:ring-neutral-600"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="cursor-pointer rounded-lg border border-neutral-200 px-3 py-1.5 text-xs dark:border-neutral-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="cursor-pointer rounded-lg bg-neutral-950 px-4 py-1.5 text-xs font-medium text-white dark:bg-white dark:text-neutral-950"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : aboutText ? (
              <p className="whitespace-pre-wrap text-[14px] sm:text-[15px] leading-relaxed text-neutral-700 dark:text-neutral-300">
                {aboutText}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-[14px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {bio}
                </p>
                <ul className="space-y-1.5 text-[13.5px] text-neutral-600 dark:text-neutral-400">
                  {bioPoints.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => {
                    setDraft("");
                    setEditing(true);
                  }}
                  className="inline-flex cursor-pointer items-center gap-1.5 pt-1 text-xs font-mono text-neutral-500 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                >
                  <Pencil className="h-3 w-3" />
                  <span>Write more about yourself</span>
                </button>
              </div>
            )}
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl bg-neutral-100/65 p-4 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/45 dark:hover:bg-neutral-900/75"
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <FaGithub className="h-4 w-4" />
                <span>GitHub (@{PORTFOLIO_PROFILE.githubUsername})</span>
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
            </a>

            <Link
              href={websiteHref}
              className="flex items-center justify-between rounded-xl bg-neutral-100/65 p-4 transition-colors hover:bg-neutral-100 dark:bg-neutral-900/45 dark:hover:bg-neutral-900/75"
            >
              <span className="inline-flex items-center gap-2 font-medium">
                <Link2 className="h-4 w-4" />
                <span>{websiteLabel}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400">
                <Calendar className="h-3 w-3" />
                {joined}
              </span>
            </Link>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="flex flex-wrap items-center gap-4 text-xs font-mono text-neutral-500 dark:text-neutral-400">
            <Link
              href="/tejas/experience"
              className="hover:text-neutral-950 dark:hover:text-white"
            >
              Experience →
            </Link>
            <Link
              href="/tejas/projects"
              className="hover:text-neutral-950 dark:hover:text-white"
            >
              Projects →
            </Link>
            <Link
              href="/tejas/highlights"
              className="hover:text-neutral-950 dark:hover:text-white"
            >
              Proof &amp; Activity →
            </Link>
            <Link
              href="/tejas/blog"
              className="hover:text-neutral-950 dark:hover:text-white"
            >
              Blogs →
            </Link>
          </section>
        </Reveal>
      </main>
    </div>
  );
}
