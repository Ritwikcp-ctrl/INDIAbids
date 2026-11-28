"use client";

import { Children, isValidElement, useState, type ReactNode } from "react";
import { Check, Code2, Copy, FileCode2 } from "lucide-react";

interface CodeBlockProps {
  children?: ReactNode;
  rawCode?: string;
  filename?: string;
  language?: string;
  className?: string;
}

function extractPlainText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (!node) return "";
  if (Array.isArray(node)) {
    return node.map(extractPlainText).join("");
  }
  if (isValidElement<{ children?: ReactNode; "data-line"?: unknown }>(node)) {
    const inner = extractPlainText(node.props.children);
    if (node.props["data-line"] !== undefined && !inner.endsWith("\n")) {
      return `${inner}\n`;
    }
    return inner;
  }
  return "";
}

export function CodeBlock({
  children,
  rawCode,
  filename,
  language,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const plainText = (rawCode ?? extractPlainText(children)).replace(/\n$/, "");
  const lineList = plainText.split("\n");
  const displayLang = (language || "text").toLowerCase();
  const displayTitle = filename || displayLang;

  const handleCopy = async () => {
    if (!plainText) return;
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  return (
    <div
      className={`my-5 overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-200 bg-neutral-100/80 px-3.5 py-2 dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center gap-2 min-w-0">
          <FileCode2 className="h-3.5 w-3.5 shrink-0 text-neutral-500 dark:text-neutral-400" />
          <span className="truncate font-mono text-xs font-semibold text-neutral-900 dark:text-neutral-100">
            {displayTitle}
          </span>
          {filename && (
            <span className="rounded border border-neutral-300 bg-white px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-neutral-600 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
              {displayLang}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowRaw((r) => !r)}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 py-1 font-mono text-[10.5px] font-medium text-neutral-700 transition-colors hover:border-neutral-500 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-neutral-500 dark:hover:text-white"
          >
            <Code2 className="h-3 w-3" />
            <span>{showRaw ? "Styled" : "Raw"}</span>
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 py-1 font-mono text-[10.5px] font-medium text-neutral-700 transition-colors hover:border-neutral-950 hover:text-neutral-950 dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300 dark:hover:border-white dark:hover:text-white"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mdx-code-pre overflow-x-auto bg-[#fafafa] py-3.5 text-[12.5px] leading-[1.65] dark:bg-[#0d0d0d]">
        {showRaw || !children ? (
          <pre className="px-4 font-mono text-neutral-800 dark:text-neutral-200">
            <code>
              {lineList.map((line, idx) => (
                <span key={idx} className="block">
                  <span className="mr-5 inline-block w-6 select-none text-right text-[11px] text-neutral-400">
                    {idx + 1}
                  </span>
                  <span>{line || " "}</span>
                </span>
              ))}
            </code>
          </pre>
        ) : (
          <div className="min-w-max px-4">{Children.only(children) ? children : children}</div>
        )}
      </div>
    </div>
  );
}
