"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import {
  FaGithub,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaEnvelope,
  FaDiscord,
} from "react-icons/fa";

export interface SocialItem {
  letter: string;
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface SocialFlipButtonProps {
  items?: SocialItem[];
  className?: string;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
  lineClassName?: string;
  containerClassName?: string;
}

const defaultItems: SocialItem[] = [
  { letter: "C", icon: <FaGithub />, label: "GitHub", href: "https://github.com" },
  { letter: "O", icon: <FaTwitter />, label: "X / Twitter", href: "https://x.com" },
  { letter: "N", icon: <FaLinkedin />, label: "LinkedIn", href: "https://linkedin.com" },
  { letter: "T", icon: <FaInstagram />, label: "Instagram", href: "https://instagram.com" },
  { letter: "A", icon: <FaFacebook />, label: "Facebook", href: "https://facebook.com" },
  { letter: "C", icon: <FaEnvelope />, label: "Email", href: "mailto:hello@indiabids.in" },
  { letter: "T", icon: <FaDiscord />, label: "Discord", href: "https://discord.com" },
];

const SocialFlipNode = ({
  item,
  index,
  isHovered,
  setTooltipIndex,
  tooltipIndex,
  itemClassName,
  frontClassName,
  backClassName,
}: {
  item: SocialItem;
  index: number;
  isHovered: boolean;
  setTooltipIndex: (val: number | null) => void;
  tooltipIndex: number | null;
  itemClassName?: string;
  frontClassName?: string;
  backClassName?: string;
}) => {
  const isExternal = Boolean(item.href?.startsWith("http"));
  const Wrapper = item.href ? "a" : "button";
  const wrapperProps = item.href
    ? {
        href: item.href,
        ...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {}),
        "aria-label": item.label,
      }
    : {
        type: "button" as const,
        onClick: item.onClick,
        "aria-label": item.label,
      };

  return (
    <Wrapper
      {...wrapperProps}
      className={cn("relative h-9 w-9 cursor-pointer block outline-none", itemClassName)}
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
        {/* Front - Letter */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg border border-border/70 bg-secondary text-sm font-bold text-foreground shadow-sm",
            frontClassName
          )}
          style={{ backfaceVisibility: "hidden" }}
        >
          {item.letter}
        </div>

        {/* Back - Icon */}
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-lg bg-[#FF4D1F] text-sm text-white dark:text-[#111013]",
            backClassName
          )}
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          {item.icon}
        </div>
      </motion.div>
    </Wrapper>
  );
};

export default function SocialFlipButton({
  items = defaultItems,
  className,
  itemClassName,
  frontClassName,
  backClassName,
  lineClassName,
  containerClassName,
}: SocialFlipButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <div
        className={cn(
          "group relative flex items-center justify-center gap-1.5 rounded-2xl border border-border/80 bg-card/90 p-2.5 shadow-sm backdrop-blur-md",
          containerClassName
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setTooltipIndex(null);
        }}
      >
        {/* Border Lines Container - Clipped */}
        <div className="pointer-events-none absolute -inset-[1px] overflow-hidden rounded-2xl">
          <motion.div
            className={cn(
              "absolute top-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#FF4D1F]/60 to-transparent",
              lineClassName
            )}
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
          <motion.div
            className={cn(
              "absolute bottom-0 left-0 h-[1px] w-full bg-gradient-to-r from-transparent via-[#FF4D1F]/60 to-transparent",
              lineClassName
            )}
            animate={{ x: ["100%", "-100%"] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        {items.map((item, index) => (
          <SocialFlipNode
            key={`${item.label}-${index}`}
            item={item}
            index={index}
            isHovered={isHovered}
            setTooltipIndex={setTooltipIndex}
            tooltipIndex={tooltipIndex}
            itemClassName={itemClassName}
            frontClassName={frontClassName}
            backClassName={backClassName}
          />
        ))}
      </div>
    </div>
  );
}
