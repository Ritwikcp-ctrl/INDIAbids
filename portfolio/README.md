# Tejas | Developer — Standalone Portfolio

Blueprint-style Next.js 16 developer portfolio featuring:
- Interactive `Cmd / Ctrl + K` Command Palette
- `#experience` timeline with stack tags & highlights
- Interactive Project Showcase modal (featuring **INDIAbids** as the flagship project)
- Engineering Highlights & deterministic contribution heatmap
- Skills & Tech Stack grid + modal Technical Writing reader
- 3D `SocialFlipButton` connect block + dark/light theming

## Run Locally
```bash
cd portfolio
npm install
npm run dev
```
Open `http://localhost:3000`.

## Customize Content
Edit [`lib/portfolio-data.ts`](lib/portfolio-data.ts) to update your bio, experience roles, projects, GitHub/X/LinkedIn links, and writing posts.

## Deploy
- **Vercel / Cloudflare Pages:** Set Root Directory to `portfolio`, build command `npm run build`.
- Link your deployed portfolio URL in INDIAbids via `NEXT_PUBLIC_PORTFOLIO_URL` in `web/.env.local`.
