"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

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
    <div className="w-full max-w-sm rounded-xl card-surface p-6 sm:p-8 shadow-xl border border-border/80 font-sans text-foreground">
      <div className="pb-5 border-b border-border/50 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-3">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground font-bold text-xs">
            IB
          </span>
          <span className="font-bold text-base text-foreground">
            INDIA<span className="text-primary font-black">bids</span>
          </span>
        </Link>
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Sign In
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Access your claimed business listings and dashboard
        </p>
      </div>

      <div className="pt-5">
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
          <Button
            type="submit"
            className="w-full text-xs font-semibold h-9 shadow-sm mt-2"
            disabled={busy}
          >
            {busy ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="mt-5 text-xs text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-primary underline font-medium">
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
    <main className="min-h-screen relative flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Suspense fallback={<p className="text-xs text-muted-foreground">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
