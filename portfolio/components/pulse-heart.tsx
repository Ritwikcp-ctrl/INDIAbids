"use client";

import { useState, type CSSProperties, type ReactNode } from "react";

const ICON_PATHS: Record<"heart" | "star" | "thumb", string[]> = {
  heart: [
    "M19.4626 3.99415C16.7809 2.34923 14.4404 3.01211 13.0344 4.06801C12.4578 4.50096 12.1696 4.71743 12 4.71743C11.8304 4.71743 11.5422 4.50096 10.9656 4.06801C9.55962 3.01211 7.21909 2.34923 4.53744 3.99415C1.01807 6.15294 0.221721 13.2749 8.33953 19.2834C9.88572 20.4278 10.6588 21 12 21C13.3412 21 14.1143 20.4278 15.6605 19.2834C23.7783 13.2749 22.9819 6.15294 19.4626 3.99415Z",
  ],
  star: [
    "M13.7276 3.44418L15.4874 6.99288C15.7274 7.48687 16.3673 7.9607 16.9073 8.05143L20.0969 8.58575C22.1367 8.92853 22.6167 10.4206 21.1468 11.8925L18.6671 14.3927C18.2471 14.8161 18.0172 15.6327 18.1471 16.2175L18.8571 19.3125C19.417 21.7623 18.1271 22.71 15.9774 21.4296L12.9877 19.6452C12.4478 19.3226 11.5579 19.3226 11.0079 19.6452L8.01827 21.4296C5.8785 22.71 4.57865 21.7522 5.13859 19.3125L5.84851 16.2175C5.97849 15.6327 5.74852 14.8161 5.32856 14.3927L2.84884 11.8925C1.389 10.4206 1.85895 8.92853 3.89872 8.58575L7.08837 8.05143C7.61831 7.9607 8.25824 7.48687 8.49821 6.99288L10.258 3.44418C11.2179 1.51861 12.7777 1.51861 13.7276 3.44418Z",
  ],
  thumb: [
    "M7 11V20H4C3.44772 20 3 19.5523 3 19V12C3 11.4477 3.44772 11 4 11H7ZM7 11L11.2929 3.70711C11.6834 3.31658 12.3166 3.31658 12.7071 3.70711C12.8946 3.89464 13 4.149 13 4.41421V8H18.4384C19.658 8 20.5839 9.10329 20.3694 10.3042L19.0123 17.9042C18.842 18.8576 18.0128 19.5523 17.0442 19.5523H7V11Z",
  ],
};

export interface PulseHeartProps {
  liked?: boolean;
  defaultLiked?: boolean;
  count?: number;
  onChange?: (liked: boolean, count: number) => void;
  showCount?: boolean;
  icon?: "heart" | "star" | "thumb" | ReactNode;
  idleOutline?: boolean;
  size?: number;
  corner?: number;
  likedColor?: string;
  idleColor?: string;
  pillColor?: string;
  textColor?: string;
  duration?: number;
  dotSize?: number;
  overshoot?: number;
  beat?: number;
  rollDuration?: number;
  disabled?: boolean;
  label?: string;
  className?: string;
}

const format = (n: number) => new Intl.NumberFormat().format(n);

export default function PulseHeart({
  liked: likedProp,
  defaultLiked = false,
  count = 0,
  onChange,
  showCount = true,
  icon = "heart",
  size = 18,
  corner = 999,
  likedColor = "#ff4d6d",
  idleColor = "#71717a",
  pillColor = "#f4f4f5",
  textColor = "#09090b",
  disabled = false,
  label = "Like",
  className = "",
}: PulseHeartProps) {
  const controlled = likedProp !== undefined;
  const [innerLiked, setInnerLiked] = useState(defaultLiked);
  const [innerDelta, setInnerDelta] = useState(0);
  const [bumping, setBumping] = useState(false);

  const liked = controlled ? likedProp : innerLiked;
  const total = Math.max(0, controlled ? count : count + innerDelta);

  const handleClick = () => {
    if (disabled) return;
    const nextLiked = !liked;
    const nextCount = Math.max(0, total + (nextLiked ? 1 : -1));
    if (!controlled) {
      setInnerLiked(nextLiked);
      setInnerDelta((d) => d + (nextLiked ? 1 : -1));
    }
    setBumping(true);
    setTimeout(() => setBumping(false), 240);
    onChange?.(nextLiked, nextCount);
  };

  const paths =
    typeof icon === "string" && icon in ICON_PATHS
      ? ICON_PATHS[icon as keyof typeof ICON_PATHS]
      : null;

  return (
    <button
      type="button"
      aria-pressed={liked}
      aria-label={showCount ? `${label}, ${format(total)}` : label}
      disabled={disabled}
      onClick={handleClick}
      className={`group inline-flex cursor-pointer touch-manipulation select-none items-center gap-1.5 px-2.5 py-1 transition-transform active:scale-95 disabled:cursor-default disabled:opacity-50 ${className}`}
      style={
        {
          borderRadius: `${corner}px`,
          backgroundColor: pillColor,
          color: textColor,
        } as CSSProperties
      }
    >
      <span
        className={`inline-flex items-center justify-center transition-transform duration-200 ${
          bumping ? "scale-125" : "scale-100"
        }`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          color: liked ? likedColor : idleColor,
        }}
        aria-hidden="true"
      >
        {paths ? (
          <svg
            viewBox="0 0 24 24"
            className="h-full w-full"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {paths.map((d, idx) => (
              <path key={idx} d={d} />
            ))}
          </svg>
        ) : (
          icon
        )}
      </span>

      {showCount && (
        <span className="text-xs font-medium tabular-nums leading-none">
          {format(total)}
        </span>
      )}
    </button>
  );
}
