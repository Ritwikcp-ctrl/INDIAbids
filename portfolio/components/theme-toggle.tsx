"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";
import { playThemeToggleSound } from "@/lib/sound";

const emptySubscribe = () => () => {};

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Toggle theme"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border bg-card/60"
      />
    );
  }

  const isDark = (resolvedTheme ?? theme) === "dark";

  const handleToggle = () => {
    const nextTheme = isDark ? "light" : "dark";
    playThemeToggleSound(nextTheme);
    setTheme(nextTheme);
  };

  return (
    <button
      type="button"
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={handleToggle}
      className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-border bg-secondary/80 text-foreground transition-all hover:bg-secondary active:scale-[0.95]"
    >
      {isDark ? (
        <Sun className="h-3.5 w-3.5 text-white" />
      ) : (
        <Moon className="h-3.5 w-3.5 text-black" />
      )}
    </button>
  );
}
