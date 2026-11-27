"use client";

let audioCtx: AudioContext | null = null;

/**
 * Plays a crisp, subtle Web Audio API click-chime when switching themes.
 */
export function playThemeToggleSound(nextTheme: "light" | "dark"): void {
  if (typeof window === "undefined") return;

  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;

    if (!audioCtx) {
      audioCtx = new AudioCtx();
    }
    if (audioCtx.state === "suspended") {
      void audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    if (nextTheme === "light") {
      osc.frequency.setValueAtTime(460, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.055);
    } else {
      osc.frequency.setValueAtTime(560, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.06);
    }

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.075);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch {
    // Ignore audio errors when autoplay/audio hardware is unavailable
  }
}
