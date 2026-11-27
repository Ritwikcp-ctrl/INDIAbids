"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CreepyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  coverClassName?: string;
}

export function CreepyButton({
  children,
  className,
  coverClassName,
  onClick,
  ...props
}: CreepyButtonProps) {
  const eyesRef = useRef<HTMLSpanElement>(null);
  const [eyeCoords, setEyeCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const updateEyes = (e: React.MouseEvent | React.TouchEvent) => {
    const userEvent =
      "touches" in e ? (e as React.TouchEvent).touches[0] : (e as React.MouseEvent);
    if (!eyesRef.current || !userEvent) return;
    const eyesRect = eyesRef.current.getBoundingClientRect();
    const eyesCenter = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2,
    };
    const dx = userEvent.clientX - eyesCenter.x;
    const dy = userEvent.clientY - eyesCenter.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;
    const distance = Math.hypot(dx, dy);
    const x = (Math.sin(angle) * Math.min(distance, 180)) / 180;
    const y = (Math.cos(angle) * Math.min(distance, 75)) / 75;
    setEyeCoords({ x, y });
  };

  const pupilStyle = {
    transform: `translate(calc(-50% + ${eyeCoords.x * 50}%), calc(-50% + ${eyeCoords.y * 50}%))`,
  };

  return (
    <button
      className={cn(
        "relative min-w-[6em] rounded-full bg-neutral-900 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 cursor-pointer outline-none select-none",
        className
      )}
      onClick={onClick}
      onMouseMove={(e) => {
        updateEyes(e);
        setIsHovered(true);
      }}
      onTouchMove={updateEyes}
      onMouseLeave={() => {
        setEyeCoords({ x: 0, y: 0 });
        setIsHovered(false);
      }}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      {...props}
    >
      <span
        ref={eyesRef}
        className="absolute flex items-center gap-[0.3em] right-[0.8em] bottom-[0.35em] h-[0.65em] z-0 pointer-events-none"
      >
        {[0, 1].map((idx) => (
          <motion.span
            key={idx}
            className="relative w-[0.65em] bg-white rounded-full overflow-hidden"
            animate={{ height: ["0.65em", "0.65em", "0em", "0.65em"] }}
            transition={{
              duration: 3,
              times: [0, 0.92, 0.96, 1],
              repeat: Infinity,
              ease: "linear",
            }}
          >
            <span
              className="absolute top-1/2 left-1/2 w-[0.32em] h-[0.32em] bg-black rounded-full transition-transform duration-75 ease-out"
              style={pupilStyle}
            />
          </motion.span>
        ))}
      </span>

      <motion.span
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 font-semibold px-3.5 py-1.5 text-[11px] origin-[1.2em_50%]",
          coverClassName
        )}
        animate={{ rotate: isHovered ? -12 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, mass: 0.8 }}
      >
        {children}
      </motion.span>

      <span
        className={cn(
          "flex items-center justify-center opacity-0 px-3.5 py-1.5 font-semibold text-[11px] min-w-[6em]",
          coverClassName
        )}
      >
        {children}
      </span>
    </button>
  );
}
