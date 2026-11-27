"use client";

import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { CodeBlock } from "@/components/portfolio/code-block";

interface GistFile {
  filename: string;
  language: string | null;
  content: string;
  raw_url: string;
}

interface GitHubGistProps {
  id: string;
}

const VALID_GIST_ID = /^[a-f0-9]{6,64}$/i;

export function GitHubGist({ id }: GitHubGistProps) {
  const safeId = VALID_GIST_ID.test(id.trim()) ? id.trim() : "";
  const [files, setFiles] = useState<GistFile[]>([]);
  const [description, setDescription] = useState<string>("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!safeId) return;
    const controller = new AbortController();

    fetch(`https://api.github.com/gists/${encodeURIComponent(safeId)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch Gist");
        return res.json();
      })
      .then((json: { description?: string; files?: Record<string, GistFile> }) => {
        if (controller.signal.aborted) return;
        setDescription(json.description ?? "");
        const list = json.files ? Object.values(json.files) : [];
        setFiles(list);
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });

    return () => controller.abort();
  }, [safeId]);

  if (!safeId) {
    return null;
  }

  const gistWebUrl = `https://gist.github.com/${safeId}`;

  if (files.length === 0) {
    return (
      <div className="my-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <FaGithub className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            <div>
              <p className="font-mono text-xs font-semibold">
                GitHub Gist · {safeId}
              </p>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                {failed
                  ? "Unable to stream remote Gist API in this environment."
                  : "Loading live Gist files from GitHub..."}
              </p>
            </div>
          </div>
          <a
            href={gistWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-3 py-1 font-mono text-[11px] font-medium hover:border-neutral-950 dark:border-neutral-700 dark:hover:border-white"
          >
            <span>Open Gist</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="my-5 space-y-3">
      {description && (
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
      {files.map((file) => (
        <CodeBlock
          key={file.filename}
          filename={file.filename}
          language={file.language ?? "text"}
          rawCode={file.content}
          gistUrl={file.raw_url || gistWebUrl}
          className="my-0"
        />
      ))}
    </div>
  );
}
