// components/api/razorpay.ts
"use client";

let loaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Injects https://checkout.razorpay.com/v1/checkout.js once.
 * Subsequent calls return the same promise, so it never double-loads.
 */
export function loadRazorpay(): Promise<void> {
  if (typeof window === "undefined") {
    // SSR guard — callers should only invoke this from event handlers.
    return Promise.reject(new Error("loadRazorpay() called during SSR."));
  }
  if (loaded) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      loaded = true;
      resolve();
    };
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load Razorpay Checkout."));
    };
    document.body.appendChild(script);
  });

  return loadingPromise;
}

/** Minimal type for the Razorpay constructor injected by the script. */
export interface RazorpayOptions {
  key: string;
  amount: number;            // paise
  currency: string;          // "INR"
  name: string;
  description?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: () => void;
  modal?: { ondismiss?: () => void };
}

export interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}