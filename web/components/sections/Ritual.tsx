"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { formatInr } from "@/components/ui/lib/money";
import { REAL_CATEGORIES } from "@/types/categories";
import { Terminal, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";

const steps = ["SELECT SECTOR", "STAKE ALLOCATION", "BRAND PROTOCOL"] as const;

export function Ritual() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [stake, setStake] = useState(500);
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  function reset() {
    setStep(0);
    setSelectedSlug(null);
    setStake(500);
    setUrl("");
    setName("");
  }

  function handleComplete() {
    const slug = selectedSlug || REAL_CATEGORIES[0].slug;
    router.push(
      `/bid?scope=national&categorySlug=${slug}&suggestedAmount=${stake}&url=${encodeURIComponent(
        url
      )}&name=${encodeURIComponent(name)}`
    );
    setOpen(false);
  }

  return (
    <section className="border-t border-cyan-500/20 px-4 py-20 text-center sm:px-6 relative">
      <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/20 px-3.5 py-1 text-xs font-mono text-cyan-400">
        <Terminal className="h-3.5 w-3.5" />
        THE CYBER PROTOCOL // ZERO BARRIER
      </div>

      <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl text-foreground">
        Three steps to claim rank #1.
      </h2>
      <p className="mt-2 text-xs sm:text-sm font-mono text-muted-foreground">
        No account required. Automated fulfillment via Razorpay webhook. Leaderboard updates instantly on commit.
      </p>

      <Button
        size="lg"
        className="mt-8 font-mono font-bold bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_25px_rgba(0,240,255,0.45)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] transition-all"
        onClick={() => setOpen(true)}
      >
        INITIALIZE CLAIM PROTOCOL →
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto bg-black/95 border border-cyan-500/50 shadow-[0_0_40px_rgba(0,240,255,0.25)] font-mono text-foreground">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold text-cyan-400 flex items-center justify-between">
              <span>STEP {step + 1} / 3 // {steps[step]}</span>
              <span className="text-[10px] text-muted-foreground">INDIAbids PROTOCOL</span>
            </DialogTitle>
          </DialogHeader>

          <Progress value={((step + 1) / 3) * 100} className="mb-4 h-1.5 bg-cyan-950" />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Select target sector from the 23 verified categories:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                    {REAL_CATEGORIES.map((c) => (
                      <Card
                        key={c.slug}
                        onClick={() => setSelectedSlug(c.slug)}
                        className={`cursor-pointer p-3 text-xs transition-all ${
                          selectedSlug === c.slug
                            ? "border-cyan-400 bg-cyan-950/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] font-bold"
                            : "border-cyan-500/20 bg-black/60 hover:border-cyan-500/50"
                        }`}
                      >
                        <p className="font-semibold text-foreground">{c.name}</p>
                        <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                          {c.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4 py-2">
                  <p className="text-xs text-muted-foreground">
                    Allocate your entry stake. All spend accumulates permanently. Outbid competitors by raising the difference.
                  </p>
                  <Slider
                    value={[stake]}
                    min={500}
                    max={25000}
                    step={100}
                    onValueChange={(v) => setStake(Array.isArray(v) ? v[0] : v)}
                  />
                  <div className="text-center py-4 rounded-lg border border-cyan-500/30 bg-cyan-950/20">
                    <span className="text-4xl font-black font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-amber-300 neon-text-cyan">
                      {formatInr(stake)}
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      National floor is ₹500 · State floor is ₹100
                    </p>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-3 py-2">
                  <div>
                    <label className="text-xs font-bold text-cyan-300 block mb-1">
                      BUSINESS / BRAND NAME
                    </label>
                    <Input
                      placeholder="e.g. Acme AI Technologies"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-xs h-10 bg-black border-cyan-500/30 text-foreground focus:border-cyan-400"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-cyan-300 block mb-1">
                      WEBSITE OR PROFILE URL
                    </label>
                    <Input
                      placeholder="https://acme.in or @handle"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="text-xs h-10 bg-black border-cyan-500/30 text-foreground focus:border-cyan-400"
                    />
                  </div>
                  <div className="rounded-lg border border-cyan-500/20 bg-cyan-950/15 p-3 text-[11px] text-muted-foreground">
                    Instant fulfillment via Razorpay checkout. You will receive a one-time cryptographic manage token upon payment.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex justify-between border-t border-cyan-500/20 pt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              BACK
            </Button>

            {step < 2 ? (
              <Button
                size="sm"
                onClick={() => setStep((s) => s + 1)}
                disabled={step === 0 && !selectedSlug}
                className="bg-cyan-500/20 hover:bg-cyan-400 text-cyan-300 hover:text-black border border-cyan-500/40 text-xs font-bold font-mono"
              >
                NEXT STEP →
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={!name.trim()}
                className="bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold font-mono shadow-[0_0_20px_rgba(0,240,255,0.5)]"
              >
                PROCEED TO BID →
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
