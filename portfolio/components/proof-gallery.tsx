"use client";

import { useRef, useState } from "react";
import { ImagePlus, Plus, Trash2, Upload } from "lucide-react";
import {
  compressAndReadImage,
  parseStoredJson,
  useLocalValue,
  writeLocalValue,
} from "@/lib/portfolio-storage";

export interface ProofShot {
  id: string;
  src: string;
  caption: string;
}

const PROOF_KEY = "tejas_proof_screenshots";
const EMPTY_JSON = "[]";

interface ProofGalleryProps {
  compact?: boolean;
}

export function ProofGallery({ compact = false }: ProofGalleryProps) {
  const raw = useLocalValue(PROOF_KEY, EMPTY_JSON);
  const shots = parseStoredJson<ProofShot[]>(raw, []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [captionDraft, setCaptionDraft] = useState("");
  const [isPastingFocus, setIsPastingFocus] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (fileArray.length === 0) return;

    let current = [...shots];
    let processed = 0;

    fileArray.forEach((file, idx) => {
      compressAndReadImage(
        file,
        (dataUrl) => {
          current = [
            ...current,
            {
              id: `shot-${current.length + idx + 1}-${file.name.slice(0, 8)}`,
              src: dataUrl,
              caption: file.name.replace(/\.[^.]+$/, ""),
            },
          ];
          processed += 1;
          if (processed === fileArray.length) {
            writeLocalValue(PROOF_KEY, JSON.stringify(current));
          }
        },
        { maxWidth: 960, maxHeight: 720, quality: 0.8 }
      );
    });
  };

  const handleRemove = (id: string) => {
    const next = shots.filter((s) => s.id !== id);
    writeLocalValue(PROOF_KEY, next.length > 0 ? JSON.stringify(next) : null);
  };

  const saveCaption = (id: string) => {
    const next = shots.map((s) =>
      s.id === id ? { ...s, caption: captionDraft.trim() || "Screenshot" } : s
    );
    writeLocalValue(PROOF_KEY, JSON.stringify(next));
    setEditingCaptionId(null);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          compressAndReadImage(
            file,
            (dataUrl) => {
              const next = [
                ...shots,
                {
                  id: `shot-paste-${shots.length + 1}`,
                  src: dataUrl,
                  caption: "Screenshot",
                },
              ];
              writeLocalValue(PROOF_KEY, JSON.stringify(next));
            },
            { maxWidth: 960, maxHeight: 720, quality: 0.8 }
          );
          return;
        }
      }
    }
  };

  const trackShots = shots.length > 0 ? [...shots, ...shots] : [];

  return (
    <div
      tabIndex={0}
      onFocus={() => setIsPastingFocus(true)}
      onBlur={() => setIsPastingFocus(false)}
      onPaste={handlePaste}
      className="rounded-2xl border border-neutral-200 bg-white p-5 space-y-4 outline-none dark:border-neutral-800 dark:bg-neutral-950"
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold">Proof Gallery &amp; Screenshots</p>
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
            {shots.length > 0
              ? `${shots.length} uploaded ${
                  shots.length === 1 ? "screenshot" : "screenshots"
                } · hover to pause`
              : isPastingFocus
                ? "Press Ctrl+V to paste image, or upload multiple screenshots"
                : "Upload multiple screenshots (moves left to right like testimonials)"}
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1 text-[10.5px] font-mono font-medium text-neutral-800 transition-colors hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-200 dark:hover:border-white dark:hover:text-white"
        >
          <Plus className="h-3 w-3" />
          <span>Upload Photos</span>
        </button>
      </div>

      {shots.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 bg-[#fafafa] px-4 py-8 text-center transition-colors hover:border-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-600"
        >
          <ImagePlus className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
          <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Click to select multiple screenshots or press Ctrl+V to paste
          </span>
          <span className="inline-flex items-center gap-1 text-[10.5px] font-mono text-neutral-400">
            <Upload className="h-3 w-3" /> Persists in your browser across page refreshes
          </span>
        </button>
      ) : (
        <div className="marquee-group relative overflow-hidden rounded-xl border border-neutral-100 bg-[#fafafa] py-3 dark:border-neutral-900 dark:bg-[#0d0d0d]">
          <div
            className="animate-marquee-right flex w-max gap-4 px-2"
            style={{
              animationDuration: `${Math.max(18, shots.length * 8)}s`,
            }}
          >
            {trackShots.map((shot, idx) => (
              <div
                key={`${shot.id}-${idx}`}
                className={`group/card relative shrink-0 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 ${
                  compact ? "w-64 sm:w-72" : "w-72 sm:w-80"
                }`}
              >
                <div className="relative h-40 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shot.src}
                    alt={shot.caption || "Proof screenshot"}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    aria-label="Remove screenshot"
                    onClick={() => handleRemove(shot.id)}
                    className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white/90 text-neutral-900 opacity-0 transition-opacity group-hover/card:opacity-100 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-white"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>

                <div className="border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
                  {editingCaptionId === `${shot.id}-${idx}` ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        saveCaption(shot.id);
                      }}
                      className="flex items-center gap-1.5"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={captionDraft}
                        onChange={(e) => setCaptionDraft(e.target.value)}
                        onBlur={() => saveCaption(shot.id)}
                        className="w-full rounded border border-neutral-300 bg-[#fafafa] px-2 py-0.5 text-[11px] font-mono outline-none dark:border-neutral-700 dark:bg-neutral-900"
                      />
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setCaptionDraft(shot.caption);
                        setEditingCaptionId(`${shot.id}-${idx}`);
                      }}
                      className="w-full truncate text-left text-[11px] font-mono text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
                    >
                      {shot.caption || "Click to add caption"}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
