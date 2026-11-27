import { Children, isValidElement, type HTMLAttributes, type ReactNode } from "react";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { CodeBlock } from "@/components/code-block";
import { GitHubGist } from "@/components/github-gist";

interface MdxContentProps {
  source: string;
  gistUrl?: string;
}

function getNodeText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return getNodeText(node.props.children);
  }
  return "";
}

export function MdxContent({ source, gistUrl }: MdxContentProps) {
  return (
    <div className="space-y-4 text-sm sm:text-[15.5px] leading-relaxed text-neutral-700 dark:text-neutral-300">
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            rehypePlugins: [
              [
                rehypePrettyCode,
                {
                  theme: { dark: "github-dark", light: "github-light" },
                  keepBackground: false,
                  defaultLang: "plaintext",
                },
              ],
            ],
          },
        }}
        components={{
          GitHubGist,
          CodeBlock,
          h1: (props) => (
            <h1
              className="pt-4 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950 dark:text-white"
              {...props}
            />
          ),
          h2: (props) => (
            <h2
              className="pt-6 text-lg sm:text-xl font-bold tracking-tight text-neutral-950 dark:text-white border-t border-neutral-200 dark:border-neutral-800"
              {...props}
            />
          ),
          h3: (props) => (
            <h3
              className="pt-4 text-base font-bold tracking-tight text-neutral-950 dark:text-white"
              {...props}
            />
          ),
          p: (props) => <p className="leading-relaxed" {...props} />,
          ul: (props) => <ul className="list-disc pl-5 space-y-1.5" {...props} />,
          ol: (props) => <ol className="list-decimal pl-5 space-y-1.5" {...props} />,
          li: (props) => <li className="leading-relaxed" {...props} />,
          blockquote: (props) => (
            <blockquote
              className="border-l-2 border-neutral-900 pl-4 italic text-neutral-600 dark:border-neutral-200 dark:text-neutral-400"
              {...props}
            />
          ),
          a: ({ href = "", ...props }) => {
            const isExternal = href.startsWith("http");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="font-medium text-neutral-950 underline underline-offset-4 hover:opacity-75 dark:text-white"
                {...props}
              />
            );
          },
          code: (props: HTMLAttributes<HTMLElement> & { "data-theme"?: string }) => {
            if (props["data-theme"] !== undefined) {
              return <code {...props} />;
            }
            return (
              <code
                className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[0.85em] text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
                {...props}
              />
            );
          },
          figure: (
            props: HTMLAttributes<HTMLElement> & {
              "data-rehype-pretty-code-figure"?: string;
            }
          ) => {
            if (props["data-rehype-pretty-code-figure"] === undefined) {
              return <figure {...props} />;
            }

            let filename: string | undefined;
            let language: string | undefined;
            let preElement: ReactNode = null;

            Children.forEach(props.children, (child) => {
              if (!isValidElement<Record<string, unknown>>(child)) return;
              if (child.props["data-rehype-pretty-code-title"] !== undefined) {
                filename = getNodeText(child.props.children as ReactNode).trim();
                language = (child.props["data-language"] as string | undefined) || language;
              } else if (child.type === "pre" || child.props["data-language"] !== undefined) {
                language = (child.props["data-language"] as string | undefined) || language;
                preElement = child;
              }
            });

            if (!preElement) {
              return <figure {...props} />;
            }

            return (
              <CodeBlock filename={filename} language={language} gistUrl={gistUrl}>
                {preElement}
              </CodeBlock>
            );
          },
          pre: (
            props: HTMLAttributes<HTMLPreElement> & { "data-language"?: string }
          ) => (
            <CodeBlock language={props["data-language"]} gistUrl={gistUrl}>
              <pre {...props} />
            </CodeBlock>
          ),
        }}
      />
    </div>
  );
}
