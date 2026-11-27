"use client";

import { cn } from "@/lib/utils";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function getGoogleAuthUrl(nextPath = "/dashboard"): string {
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//")
      ? nextPath
      : "/dashboard";
  return `${API_BASE}/auth/google?next=${encodeURIComponent(safeNext)}`;
}

interface GoogleAuthButtonProps {
  nextPath?: string;
  label?: string;
  className?: string;
  onBeforeRedirect?: () => void;
}

export function GoogleAuthButton({
  nextPath = "/dashboard",
  label = "Continue with Google",
  className,
  onBeforeRedirect,
}: GoogleAuthButtonProps) {
  const handleGoogleLogin = () => {
    onBeforeRedirect?.();
    window.location.href = getGoogleAuthUrl(nextPath);
  };

  return (
    <button
      type="button"
      onClick={handleGoogleLogin}
      className={cn(
        "flex h-10 w-full cursor-pointer items-center justify-center gap-2.5 rounded-xl border border-border bg-background px-4 text-xs font-semibold text-foreground transition-all duration-200 hover:border-[#FF4D1F]/40 hover:bg-secondary/70 active:scale-[0.98]",
        className
      )}
    >
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.3 0 6.08-1.09 8.11-2.96l-3.88-3.05c-1.1.74-2.51 1.18-4.23 1.18-3.26 0-6.02-2.2-7-5.16H.99v3.14C3.01 21.17 7.18 24 12 24Z"
        />
        <path
          fill="#FBBC05"
          d="M5 14.01c-.25-.74-.39-1.54-.39-2.36 0-.82.14-1.62.39-2.36V6.15H.99C.36 7.41 0 8.83 0 11.65s.36 4.24.99 5.5l4.01-3.14Z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.8 0 3.41.62 4.68 1.84l3.51-3.51C18.07 1.19 15.3 0 12 0 7.18 0 3.01 2.83.99 6.15l4.01 3.14c.98-2.96 3.74-5.16 7-5.16Z"
        />
      </svg>
      <span>{label}</span>
    </button>
  );
}
