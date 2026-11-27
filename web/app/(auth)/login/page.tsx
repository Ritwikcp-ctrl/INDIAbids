"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/auth/auth-provider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CreepyButton } from "@/components/ui/creepy-button";
import { GoogleAuthButton } from "@/components/ui/google-auth-button";
import { Navbar } from "@/components/ui/navbar";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  google_not_configured:
    "Google OAuth is not configured on the backend yet. Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to server .env.",
  google_state_invalid: "Google sign-in session expired. Please try again.",
  google_token_failed: "Could not complete Google token exchange.",
  google_unverified_email: "Your Google account email must be verified.",
  google_failed: "Google authentication failed. Please try again.",
};

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const oauthError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (oauthError) {
      toast.error(
        OAUTH_ERROR_MESSAGES[oauthError] ?? "Sign-in could not be completed."
      );
    }
  }, [oauthError]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await login({ email, password });
      router.push(next);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl card-surface p-6 sm:p-8 shadow-xl border border-border/80 font-sans text-foreground">
      <div className="pb-5 border-b border-border/50 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF4D1F] text-white dark:text-[#111013] font-bold text-xs">
            IB
          </span>
          <span className="font-bold text-base text-foreground">
            INDIA<span className="text-[#FF4D1F] font-black">bids</span>
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Sign In
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Access your claimed business listings and dashboard
        </p>
      </div>

      <div className="pt-5 space-y-4">
        <GoogleAuthButton nextPath={next} />

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/60" />
          <span className="mx-3 shrink-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            or manual sign in
          </span>
          <div className="flex-grow border-t border-border/60" />
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs font-semibold text-foreground">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.in"
              className="h-9 text-xs bg-background"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-9 text-xs bg-background"
            />
          </div>
          <CreepyButton
            type="submit"
            className="w-full text-xs mt-2"
            coverClassName="h-9 text-xs font-semibold"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign In"}
          </CreepyButton>
        </form>

        <p className="mt-5 text-xs text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-[#FF4D1F] underline font-medium">
            Register
          </Link>
          {" · "}
          <Link href="/bid" className="text-muted-foreground underline hover:text-foreground">
            Bid without account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Suspense fallback={<p className="text-xs text-muted-foreground">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
