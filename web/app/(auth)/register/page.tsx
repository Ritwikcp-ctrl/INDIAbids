"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await register({ email, password, name: name || undefined });
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-4 bg-background font-sans text-foreground">
      <div className="w-full max-w-sm rounded-xl card-surface p-6 sm:p-8 shadow-xl border border-border/80">
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
            Create an Account
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Claim, track, and manage your business rankings
          </p>
        </div>

        <div className="pt-5">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="name" className="text-xs font-semibold text-foreground">
                Your Name / Business Name (Optional)
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ritwik Rai"
                className="h-9 text-xs bg-background"
              />
            </div>
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
                placeholder="founder@company.in"
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
                minLength={8}
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
              {busy ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="mt-5 text-xs text-muted-foreground text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-primary underline font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
