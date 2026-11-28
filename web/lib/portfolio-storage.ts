"use client";

import { useSyncExternalStore } from "react";

const storageListeners = new Set<() => void>();

function subscribeStorage(cb: () => void) {
  storageListeners.add(cb);
  const onStorage = () => cb();
  window.addEventListener("storage", onStorage);
  return () => {
    storageListeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeLocalValue(key: string, value: string | null): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (value !== null) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
    storageListeners.forEach((cb) => cb());
    return true;
  } catch {
    return false;
  }
}

export function useLocalValue(key: string, fallback = ""): string {
  return useSyncExternalStore(
    subscribeStorage,
    () => localStorage.getItem(key) ?? fallback,
    () => fallback
  );
}

export function parseStoredJson<T>(raw: string, fallback: T): T {
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Compresses raster images using an offscreen canvas so uploaded photos
 * fit comfortably inside browser localStorage and persist across reloads.
 */
export function compressAndReadImage(
  file: File,
  onDone: (dataUrl: string) => void,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
) {
  const { maxWidth = 1200, maxHeight = 900, quality = 0.84 } = options;

  const reader = new FileReader();
  reader.onload = () => {
    const rawUrl = typeof reader.result === "string" ? reader.result : "";
    if (!rawUrl) return;

    if (file.type === "image/svg+xml" || rawUrl.length < 90_000) {
      onDone(rawUrl);
      return;
    }

    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(
        1,
        maxWidth / Math.max(1, img.width),
        maxHeight / Math.max(1, img.height)
      );
      const targetW = Math.max(1, Math.round(img.width * ratio));
      const targetH = Math.max(1, Math.round(img.height * ratio));

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        onDone(rawUrl);
        return;
      }

      ctx.drawImage(img, 0, 0, targetW, targetH);
      const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
      const compressed = canvas.toDataURL(
        mime,
        mime === "image/png" ? undefined : quality
      );
      if (compressed.length > 450_000 && mime === "image/png") {
        onDone(canvas.toDataURL("image/jpeg", quality));
      } else {
        onDone(compressed);
      }
    };
    img.onerror = () => onDone(rawUrl);
    img.src = rawUrl;
  };
  reader.readAsDataURL(file);
}
