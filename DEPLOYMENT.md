# INDIAbids Production Deployment Guide

This repository contains:
- **Frontend (`web/`)**: Next.js 16 App Router application.
- **Backend (`server/`)**: Express + Prisma (PostgreSQL) + Redis API server.

---

## 1. Prerequisites (Database, Cache & Payments)
1. **PostgreSQL** (Neon, Supabase, Prisma Postgres, or RDS):
   ```bash
   DATABASE_URL="postgresql://..." npx prisma db push
   DATABASE_URL="postgresql://..." npx tsx server/src/seed.ts
   ```
2. **Redis** (Upstash Redis or managed Redis):
   - Set `REDIS_URL="rediss://..."`.
3. **Razorpay Webhook**:
   - Point `payment.captured` webhook to `https://<your-api-domain>/api/v1/payments/webhooks/razorpay` with `RAZORPAY_WEBHOOK_SECRET`.

---

## 2. Frontend Hosting Options (`web/`)

Set these environment variables on your chosen host:
- `NEXT_PUBLIC_API_URL=https://<your-api-domain>/api/v1`
- `NEXT_PUBLIC_RAZORPAY_KEY_ID=<your-razorpay-key-id>`

### Option A: Vercel (Recommended for Next.js)
1. Import the repository in Vercel and set **Root Directory** to `web`.
2. Framework Preset: **Next.js** (Build command `npm run build`, Install `npm install`).
3. Add the environment variables above and deploy.

### Option B: Cloudflare Pages
1. In Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages**, set **Root directory** to `web`, build command `npm run build`, output `.next`.
2. Or deploy from CLI inside `web/`:
   ```bash
   cd web && npm run build && npx wrangler pages deploy .next --project-name=indiabids-web
   ```
   (See `web/wrangler.toml` and `CLOUDFLARE_DEPLOYMENT.md` for full details.)

### Option C: Zoho Catalyst (AppSail for Next.js SSR + Express API)
1. **Frontend AppSail Service** (Node.js runtime, source directory `web/`):
   - Build command: `npm install && npm run build`
   - Start command: `npm run start -- -H 0.0.0.0 -p ${X_ZOHO_CATALYST_LISTEN_PORT:-3000}`
2. **Backend AppSail Service** (Node.js runtime, source directory root `.`):
   - Build command: `npm install && npx prisma generate && npm run build`
   - Start command: `npm run start` (`server/src/server.ts` compiled to `dist/server.js`, automatically listening on `X_ZOHO_CATALYST_LISTEN_PORT` or `PORT` at `0.0.0.0`).
3. Configure `CORS_ORIGIN` on the backend to include your frontend URL (comma-separated if multiple, e.g. `https://indiabids.in,https://indiabids.vercel.app`) and set `TRUST_PROXY=1`.
