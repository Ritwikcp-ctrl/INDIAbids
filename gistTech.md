# Gist Architecture (`gistTech.md`)

Technical breakdown of the GitHub Gist-style code snippet and embed pipeline originally built for the portfolio blog engine. While the live blog UI was simplified into pure daily engineering notes, the underlying syntax highlighting engine and Gist architecture patterns are documented here for reference or future restoration.

---

## 1. Content & Frontmatter Design

Each post in `content/blog/*.mdx` or `*.md` supported a `type` discriminator and optional external Gist URL parsed via `gray-matter`:

```yaml
---
title: "useDebounce.ts — Zero-Stale-Closure React 19 Hook"
date: "2026-11-27"
summary: "Lightweight strict TypeScript debounce hook for React 19 inputs."
type: "article" | "gist"
tags: ["TypeScript", "React 19"]
relatedProject: "indiabids"
gistUrl: "https://gist.github.com/<username>/<gist_id>"
published: true
---
```

When `type === "gist"`, the content helper ran a regex pass over the raw Markdown body (`extractFirstCodeBlock`) to extract the opening fenced block (`language`, `title="..."` filename, and first 6 lines) so index feeds could render a compact monospace code card without compiling full MDX on index views.

---

## 2. Compile-Time Highlighting (`next-mdx-remote/rsc` + `rehype-pretty-code` + `shiki`)

Markdown code fences were compiled on the server with `next-mdx-remote/rsc` (`compileMDX` / `<MDXRemote />`) configured with `rehype-pretty-code` and `shiki`:

```ts
rehypePlugins: [
  [
    rehypePrettyCode,
    {
      theme: { dark: "github-dark", light: "github-light" },
      keepBackground: false,
      defaultLang: "plaintext",
    },
  ],
]
```

### Dual Light/Dark Token Switching & Line Numbers
Because `keepBackground: false` and dual themes (`dark` + `light`) emit `--shiki-light` and `--shiki-dark` inline CSS variables on every token `<span>`, CSS handles theme switching instantaneously with zero hydration mismatch:

```css
code[data-theme*=" "] span[data-line] span {
  color: var(--shiki-light);
}
.dark code[data-theme*=" "] span[data-line] span {
  color: var(--shiki-dark);
}
code[data-line-numbers] {
  counter-reset: line;
}
code[data-line-numbers] > [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: 1.75rem;
  margin-right: 1.15rem;
  text-align: right;
}
```

---

## 3. Custom `<CodeBlock />` Component & `<figure>` Interception

When a Markdown code block includes `title="filename.ts"`, `rehype-pretty-code` wraps the output in:
- `<figure data-rehype-pretty-code-figure>`
  - `<figcaption data-rehype-pretty-code-title data-language="ts">filename.ts</figcaption>`
  - `<pre data-language="ts">...</pre>`

In MDX component overrides:
1. Override `figure` when `data-rehype-pretty-code-figure` is present, iterate `React.Children` to read the filename from `figcaption[data-rehype-pretty-code-title]` and extract the `<pre>` child.
2. Wrap that `<pre>` inside the client `<CodeBlock />` chrome component (`components/code-block.tsx`):
   - **Plain-text extraction (`extractPlainText`)**: Recursively walks React element children and appends `\n` per `[data-line]` span so the **Copy** button copies exact multi-line plain source code (no line-number gutter digits copied).
   - **Raw vs. Highlighted toggle**: Switches between the Shiki-highlighted `<pre>` and an unstyled monospace view with explicit line numbers.
   - **External Gist link**: Renders a clickable button linking to `gistUrl` when supplied.

---

## 4. Live `<GitHubGist id="..." />` Embed Pattern

To embed an existing remote GitHub Gist directly inside MDX (`<GitHubGist id="abc123..." />`):
1. Validate `id` against `/^[a-f0-9]{6,64}$/i`.
2. Client-side fetch `https://api.github.com/gists/${id}`.
3. Iterate `Object.values(json.files)` and pass each file's `filename`, `language`, `content` (`rawCode`), and `raw_url` into `<CodeBlock />`.
4. Degrade gracefully when offline or rate-limited to a direct card linking to `https://gist.github.com/${id}`.
