# PROJECT: INDIA bids — Advertising Leaderboard
Stack: Next.js 15 (App Router) · Tailwind v4 · shadcn/ui · Framer Motion · Lenis

## AESTHETIC
Reference: motin.dev (UI-gallery grammar) at advertising temperature.
Rules: dark lit stage · glass pills · hairline dividers · one loud accent per view · no gradients on text · no cards inside cards.

## PALETTE (hex, dark-default)
--bg        #111013  Carbon Ink        (60%)
--fg        #EDE7DC  Bone              (25%)  tiers: 100 / 60 / 45 / 40 % opacity
--primary   #FF4D1F  Signal Orange     (10%)  hover #E84317
--accent2   #2F6BFF  Electric Cobalt   (5%)   glows only
--success   #3FE0A0  Live Mint                dots / "0%" metrics
--border    rgba(255,255,255,0.06–0.08)
Light mode: bg #FAF6F0 · fg #1B171C · same accents.

## TYPOGRAPHY
font: "Druk" → fallback "Helvetica Neue", Helvetica, Arial
h1: tracking -0.03em, bone, accent-word = Signal Orange
labels: 10.5px · uppercase · tracking 0.08em · fg/40
body: 15–16px · leading-relaxed · fg/60

## MOTION (the premium layer)
easing      cubic-bezier(0.22, 1, 0.36, 1)
spring      { stiffness: 260, damping: 30 }
ui dur      200–400ms   reveal dur 600–800ms
reveal      opacity 0→1 + y 20→0, whileInView, once, margin -80px
stagger     60ms between children
press       active:scale-[0.98]   hover:scale-[1.02]
smooth      Lenis duration 1.15, ease-out-expo
pages       app/template.tsx fade+y8 @350ms (or View Transitions API)
animate only opacity/transform/filter.

## NAVBAR (motin.dev pattern)
sticky top-4 · mx-auto · w-[min(1180px,calc(100%-2rem))]
shell: rounded-full · bg-[#111013]/75 · backdrop-blur-2xl · backdrop-saturate-150
       border-white/[0.08] · shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_20px_60px_-35px_rgba(0,0,0,0.9)]
layout: brand left (orange circle + wordmark) | links in own capsule (rounded-full bg-white/[0.03] p-1) | actions right
link:   12.5px · fg/65 · hover bg-white/[0.06] · active bg-[#FF4D1F]/15 text-[#FF4D1F]
cta:    h-8 rounded-full bg-[#FF4D1F] text-[#111013] shadow bloom · arrow nudges on hover
collapse padding on scroll>24px · mobile = rounded-3xl sheet below pill

## HERO
section: bg-[#111013] · py-24/28 · 2 blurred radial glows (orange top-center 35%, cobalt bottom-right 28%) · overflow-hidden
badge:   glass pill · ping dot #3FE0A0 · 11.5px fg/70
h1:      via HeroHeader wrapper `[&_h1]:!text-[#EDE7DC] [&_h1]:!tracking-[-0.03em]`
form:    "glass command bar" rounded-[26px] border-white/[0.08] bg-[#111013]/70 backdrop-blur-2xl p-2
         fields rounded-2xl bg-white/[0.03] border-white/[0.06] h-10 · micro-labels above
         submit = Signal Orange pill + arrow nudge
metrics: grid 2/4 · border-t white/[0.06] · sm:divide-x · no boxes
         value 24–26px bold tracking-[-0.02em] · label 11px fg/45 · success metric in #3FE0A0

## COMPONENT CONVENTIONS
- shadcn primitives; restyle via className, never fork.
- Dark surfaces use explicit hex; wire tokens to globals.css when stable.
- All interactive elements: transition-transform duration-150–200 ease-out.
- Never animate layout props (top/left/width/height).
- Accent budget: 1 loud element per viewport.

## DONT
no purple gradients · no glass on text · no drop shadows on body text · no bounce easing · no >500ms click feedback · no pure #000 or #FFF.