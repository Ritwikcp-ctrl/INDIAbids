"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreepyButton } from "@/components/ui/creepy-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/auth/auth-provider";

interface NavbarProps {
  user?: { name?: string | null; email?: string } | null;
}

export function Navbar({ user: userProp }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const user = userProp !== undefined ? userProp : auth.user;

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = [
    { href: "/categories", match: "/categories", label: "Categories" },
    { href: "/bid?scope=national", match: "/bid", label: "National" },
    { href: "/bid?scope=state&state=Delhi", match: "/bid-state", label: "States" },
    { href: "/#how-it-works", match: "/#how-it-works", label: "How It Works" },
    { href: "/about", match: "/about", label: "About" },
  ];

  const nextAfterLogin =
    pathname && !pathname.startsWith("/login") && !pathname.startsWith("/register")
      ? pathname
      : "/dashboard";

  return (
    <>
      <header
        className={[
          "sticky z-50 mx-auto w-fit max-w-[min(820px,calc(100%-1.25rem))] px-1 transition-all duration-200 ease-out",
          scrolled ? "top-2" : "top-3",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between gap-2 sm:gap-3",
            "rounded-full border border-black/[0.08] dark:border-white/[0.08]",
            "bg-white/85 dark:bg-[#111013]/80 backdrop-blur-2xl backdrop-saturate-150 transition-all duration-200 ease-out",
            scrolled ? "px-2.5 py-1" : "px-2.5 py-1.5",
            "shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_16px_40px_-24px_rgba(27,23,28,0.22)]",
            "dark:shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_50px_-30px_rgba(0,0,0,0.9)]",
          ].join(" ")}
        >
          {/* ── BRAND ── */}
          <Link href="/" className="flex shrink-0 items-center gap-2 pl-0.5">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FF4D1F] text-[10px] font-black tracking-tight text-white dark:text-[#111013]">
              IB
            </span>
            <span className="hidden text-[13.5px] font-bold tracking-[-0.02em] text-[#1B171C] dark:text-[#EDE7DC] sm:block">
              INDIA<span className="font-black text-[#FF4D1F]">bids</span>
            </span>
          </Link>

          {/* ── CENTERED NAV CAPSULE ── */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-black/[0.06] bg-black/[0.03] p-0.5 dark:border-white/[0.06] dark:bg-white/[0.03] md:flex">
            {navLinks.map((link) => {
              const active =
                (link.match === "/bid" && pathname === "/bid") ||
                pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={[
                    "whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-medium tracking-[-0.01em]",
                    "transition-all duration-200 active:scale-[0.98]",
                    active
                      ? "bg-[#FF4D1F]/15 text-[#FF4D1F]"
                      : "text-[#1B171C]/65 hover:bg-black/[0.05] hover:text-[#1B171C] dark:text-[#EDE7DC]/65 dark:hover:bg-white/[0.06] dark:hover:text-[#EDE7DC]",
                  ].join(" ")}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* ── ACTIONS ── */}
          <div className="flex shrink-0 items-center gap-1.5 pr-0.5">
            {user ? (
              <Button
                asChild
                variant="outline"
                size="sm"
                className={[
                  "h-7 rounded-full px-2.5 text-[11.5px] font-medium active:scale-[0.98]",
                  pathname === "/dashboard"
                    ? "border-[#FF4D1F]/40 bg-[#FF4D1F]/15 text-[#FF4D1F]"
                    : "border-black/10 bg-transparent text-[#1B171C]/80 hover:bg-black/5 hover:text-[#1B171C] dark:border-white/10 dark:text-[#EDE7DC]/80 dark:hover:bg-white/5 dark:hover:text-[#EDE7DC]",
                ].join(" ")}
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <CreepyButton
                type="button"
                onClick={() => setAuthDialogOpen(true)}
                className="rounded-full text-[11px] min-w-[5.75em]"
                coverClassName="rounded-full px-2.5 py-1 text-[11px] font-semibold min-w-[5.75em]"
              >
                Sign In
              </CreepyButton>
            )}

            <Button
              asChild
              size="sm"
              className="group h-7 rounded-full bg-[#FF4D1F] px-2.5 text-[11.5px] font-semibold text-white dark:text-[#111013] shadow-[0_6px_18px_-10px_rgba(255,77,31,0.7)] transition-all duration-200 hover:bg-[#E84317] active:scale-[0.98]"
            >
              <Link href="/bid?scope=national">
                List
                <span className="hidden sm:inline">&nbsp;Business</span>
                <ArrowRight className="ml-1 h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <ThemeToggle compact />

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-black/[0.03] text-foreground transition-colors hover:bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] md:hidden"
            >
              {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Sheet below pill (per design.md) */}
        {mobileOpen && (
          <div className="mt-2 rounded-3xl border border-black/[0.08] bg-white/95 p-3 shadow-2xl backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#161419]/95 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active =
                  (link.match === "/bid" && pathname === "/bid") ||
                  pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={[
                      "rounded-2xl px-3.5 py-2 text-xs font-semibold transition-colors",
                      active
                        ? "bg-[#FF4D1F]/15 text-[#FF4D1F]"
                        : "text-foreground/80 hover:bg-secondary",
                    ].join(" ")}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>

      {/* Sign-In Choice Modal: Google OAuth or Manual Sign In */}
      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-border/80 bg-card/95 p-6 backdrop-blur-2xl">
          <DialogHeader className="space-y-1.5 text-center sm:text-center">
            <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#FF4D1F] text-xs font-black text-white dark:text-[#111013]">
              IB
            </div>
            <DialogTitle className="text-lg font-bold tracking-tight">
              Sign in to INDIAbids
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Choose Google authentication or manual email &amp; password sign in
            </p>
          </DialogHeader>

          <div className="mt-5 space-y-3">
            <GoogleAuthButton
              nextPath={nextAfterLogin}
              onBeforeRedirect={() => setAuthDialogOpen(false)}
            />

            <div className="relative flex items-center py-1">
              <div className="flex-grow border-t border-border/60" />
              <span className="mx-3 shrink-0 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                or
              </span>
              <div className="flex-grow border-t border-border/60" />
            </div>

            <Button
              type="button"
              onClick={() => {
                setAuthDialogOpen(false);
                router.push(`/login?next=${encodeURIComponent(nextAfterLogin)}`);
              }}
              className="h-10 w-full rounded-xl bg-[#FF4D1F] text-xs font-semibold text-white dark:text-[#111013] hover:bg-[#E84317] active:scale-[0.98]"
            >
              <Mail className="mr-2 h-3.5 w-3.5" />
              Manual Sign In (Email &amp; Password)
            </Button>
          </div>

          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            New here?{" "}
            <Link
              href="/register"
              onClick={() => setAuthDialogOpen(false)}
              className="font-semibold text-[#FF4D1F] underline"
            >
              Create an account
            </Link>{" "}
            or{" "}
            <Link
              href="/bid"
              onClick={() => setAuthDialogOpen(false)}
              className="underline hover:text-foreground"
            >
              bid anonymously
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
