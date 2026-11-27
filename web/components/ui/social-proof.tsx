"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  BankIcon,
  BitcoinEllipseIcon,
  Building03Icon,
  Mic01Icon,
  NewsIcon,
  Restaurant01Icon,
  Rocket01Icon,
  ShoppingBag01Icon,
  SourceCodeIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import { Badge } from "@/components/ui/badge";

interface MarqueeTestimonial {
  brand: string;
  sector: string;
  city: string;
  quote: string;
  icon: IconSvgElement;
}

const TOP_ROW: MarqueeTestimonial[] = [
  {
    brand: "KayaBuild Studio",
    sector: "Design & Creative",
    city: "Bengaluru",
    quote: "Held #1 on National Design for 4 months with zero monthly burn.",
    icon: Rocket01Icon,
  },
  {
    brand: "Chai & Bytes",
    sector: "Podcasting",
    city: "Mumbai",
    quote: "Paid once via UPI—our sponsor inquiries doubled the same week.",
    icon: Mic01Icon,
  },
  {
    brand: "IndusStack Dev",
    sector: "Developer Tools",
    city: "Hyderabad",
    quote: "Transparent spend beats black-box ad auctions every single day.",
    icon: SourceCodeIcon,
  },
  {
    brand: "Aravalli Ventures",
    sector: "Ventures & Capital",
    city: "New Delhi",
    quote: "Founders check the top 5 before pitching. Best inbound ROI.",
    icon: BankIcon,
  },
  {
    brand: "Saffron Table",
    sector: "Restaurants & Cafes",
    city: "Jaipur",
    quote: "State board Rank #1 for ₹500 got us packed weekend bookings.",
    icon: Restaurant01Icon,
  },
];

const BOTTOM_ROW: MarqueeTestimonial[] = [
  {
    brand: "Deccan Daily",
    sector: "Media & News",
    city: "Pune",
    quote: "No subscriptions, no expiry—every rupee compounds our rank.",
    icon: NewsIcon,
  },
  {
    brand: "Namma Kart D2C",
    sector: "Ecommerce & Retail",
    city: "Chennai",
    quote: "Topping up by ₹200 to reclaim #1 took 15 seconds on Razorpay.",
    icon: ShoppingBag01Icon,
  },
  {
    brand: "Vriksh Realty",
    sector: "Real Estate",
    city: "Gurugram",
    quote: "Haryana & Delhi state boards put us right in front of buyers.",
    icon: Building03Icon,
  },
  {
    brand: "CreatorGrid IN",
    sector: "YouTube Channels",
    city: "Kolkata",
    quote: "No account needed at checkout—claimed our listing a week later.",
    icon: YoutubeIcon,
  },
  {
    brand: "MintLedger Labs",
    sector: "Crypto & Web3",
    city: "Ahmedabad",
    quote: "Pure deterministic math. You know exact rupees to beat #1.",
    icon: BitcoinEllipseIcon,
  },
];

function MarqueeCard({ item }: { item: MarqueeTestimonial }) {
  return (
    <div className="w-[300px] sm:w-[340px] shrink-0 rounded-2xl border border-border bg-card/85 p-4 sm:p-5 backdrop-blur-md transition-colors hover:border-[#FF4D1F]/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#FF4D1F]/10 text-[#FF4D1F]">
            <HugeiconsIcon icon={item.icon} size={17} strokeWidth={1.8} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-foreground">
              {item.brand}
            </p>
            <p className="truncate text-[10.5px] text-muted-foreground">
              {item.sector} · {item.city}
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-[#FF4D1F]">
          Verified
        </span>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        &ldquo;{item.quote}&rdquo;
      </p>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="py-20 border-t border-border/60 bg-background overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center mb-12">
        <Badge
          variant="outline"
          className="text-xs font-semibold uppercase tracking-wider mb-2"
        >
          Social Proof
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Trusted by Bidders Across India
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Startups, local spots, creators, and agencies claiming permanent visibility across National and State leaderboards.
        </p>
      </div>

      <div className="marquee-group space-y-4">
        {/* Top Row — scrolls left */}
        <div
          className="relative flex overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-marquee-left flex w-max gap-4 pr-4">
            {[...TOP_ROW, ...TOP_ROW].map((item, idx) => (
              <MarqueeCard key={`top-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* Bottom Row — scrolls right */}
        <div
          className="relative flex overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          }}
        >
          <div className="animate-marquee-right flex w-max gap-4 pr-4">
            {[...BOTTOM_ROW, ...BOTTOM_ROW].map((item, idx) => (
              <MarqueeCard key={`bot-${idx}`} item={item} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
