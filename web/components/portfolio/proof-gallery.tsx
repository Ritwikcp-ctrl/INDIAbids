"use client";

import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
      s.id === id ? { ...s, caption: captionDraft.trim() || "Proof" } : s
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
                  caption: "Proof",
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
      className="space-y-3 outline-none"
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

      {shots.length === 0 ? (
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 px-4 py-7 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-600 dark:hover:text-neutral-200"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>
            {isPastingFocus
              ? "Press Ctrl+V to paste or click to upload screenshots"
              : "Upload screenshots or proof of work"}
          </span>
        </button>
      ) : (
        <div className="space-y-2.5">
          <div className="marquee-group relative overflow-hidden py-1 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
            <div
              className="animate-marquee-right flex w-max gap-3.5"
              style={{
                animationDuration: `${Math.max(20, shots.length * 8)}s`,
              }}
            >
              {trackShots.map((shot, idx) => (
                <div
                  key={`${shot.id}-${idx}`}
                  className={`group/card relative shrink-0 overflow-hidden rounded-xl border border-neutral-200/80 bg-white dark:border-neutral-800/80 dark:bg-neutral-950 ${
                    compact ? "w-60 sm:w-68" : "w-68 sm:w-76"
                  }`}
                >
                  <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
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
                      className="absolute right-2 top-2 inline-flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white/90 text-neutral-800 opacity-0 transition-opacity group-hover/card:opacity-100 dark:border-neutral-700 dark:bg-neutral-950/90 dark:text-neutral-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="border-t border-neutral-200/70 px-3 py-2 dark:border-neutral-800/70">
                    {editingCaptionId === `${shot.id}-${idx}` ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          saveCaption(shot.id);
                        }}
                      >
                        <input
                          type="text"
                          autoFocus
                          value={captionDraft}
                          onChange={(e) => setCaptionDraft(e.target.value)}
                          onBlur={() => saveCaption(shot.id)}
                          className="w-full rounded border border-neutral-300 bg-transparent px-1.5 py-0.5 text-[11px] outline-none dark:border-neutral-700"
                        />
                      </form>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setCaptionDraft(shot.caption);
                          setEditingCaptionId(`${shot.id}-${idx}`);
                        }}
                        className="w-full truncate text-left text-[11.5px] font-medium text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-neutral-100"
                      >
                        {shot.caption || "Add caption"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="inline-flex cursor-pointer items-center gap-1 text-[11px] font-mono text-neutral-500 transition-colors hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
            >
              <Plus className="h-3 w-3" />
              <span>Add screenshots</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
