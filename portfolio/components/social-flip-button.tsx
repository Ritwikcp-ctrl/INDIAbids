"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface SocialItem {
  letter: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
}

export default function SocialFlipButton({
  items,
  className,
}: {
  items: SocialItem[];
  className?: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <div
        className="relative flex items-center justify-center gap-1.5 rounded-2xl border border-border bg-card/90 p-2.5 shadow-sm backdrop-blur-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipIndex(null);
        }}
      >
        <div className="pointer-events-none absolute -inset-[1px] overflow-hidden rounded-2xl">
          <motion.div
            className="absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-900/50 to-transparent dark:via-white/50"
            animate={{ x: ["-100%", "100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-neutral-900/50 to-transparent dark:via-white/50"
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </div>

        {items.map((item, index) => {
          const isExternal = Boolean(item.href?.startsWith("http"));
          return (
            <a
              key={`${item.label}-${index}`}
              href={item.href || "#"}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              aria-label={item.label}
              className="relative block h-9 w-9 cursor-pointer outline-none"
              style={{ perspective: "1000px" }}
              onMouseEnter={() => setTooltipIndex(index)}
              onMouseLeave={() => setTooltipIndex(null)}
            >
              <AnimatePresence>
                {isHovered && tooltipIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.85, x: "-50%" }}
                    animate={{ opacity: 1, y: -44, scale: 1, x: "-50%" }}
                    exit={{ opacity: 0, y: 8, scale: 0.85, x: "-50%" }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                    className="pointer-events-none absolute left-1/2 z-50 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[11px] font-semibold text-background shadow-xl"
                  >
                    {item.label}
                    <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="relative h-full w-full"
                initial={false}
                animate={{ rotateY: isHovered ? 180 : 0 }}
                transition={{
                  duration: 0.75,
                  type: "spring",
                  stiffness: 130,
                  damping: 16,
                  delay: index * 0.06,
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-lg border border-border bg-secondary text-sm font-bold text-foreground shadow-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  {item.letter}
                </div>
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-lg bg-neutral-950 text-sm text-white dark:bg-white dark:text-neutral-950"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  {item.icon}
                </div>
              </motion.div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
