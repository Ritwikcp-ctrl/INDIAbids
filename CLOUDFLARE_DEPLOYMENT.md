# Deploying INDIAbids on Cloudflare

This guide outlines how to deploy the **INDIAbids** application (Next.js frontend + Node/Express backend) on Cloudflare.

---

## 1. Architecture Overview

```
                      ┌────────────────────────────────────────┐
                      │            Cloudflare CDN              │
                      └──────────────────┬─────────────────────┘
                                         │
                 ┌───────────────────────┴───────────────────────┐
                 ▼                                               ▼
     ┌────────────────────────┐                     ┌────────────────────────┐
     │    Cloudflare Pages    │                     │   API Backend Server   │
     │   (Next.js Frontend)   │                     │  (Node.js / Express)   │
     │      indiabids.in      │                     │    api.indiabids.in    │
     └────────────────────────┘                     └───────────┬────────────┘
                                                                │
                                                ┌───────────────┴───────────────┐
                                                ▼                               ▼
                                    ┌───────────────────────┐       ┌───────────────────────┐
                                    │  PostgreSQL Database  │       │      Redis Cache      │
                                    │ (Postgres 16+ / Neon) │       │   (Upstash / Redis)   │
                                    │  *Source of Money*    │       │  *O(log N) Reads*     │
                                    └───────────────────────┘       └───────────────────────┘
```

---

## 2. Frontend Deployment (Cloudflare Pages)

The frontend is located in `/web` and built with Next.js App Router.

### Option A: Direct Git Integration via Cloudflare Dashboard
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **Create Application** → **Pages** → **Connect to Git**.
2. Select your repository.
3. Configure build settings:
   - **Framework preset**: `Next.js`
   - **Root directory**: `web`
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
4. Set Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://api.indiabids.in/api/v1` (or your backend URL)
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`: `rzp_live_...` (or test key)
5. Click **Save and Deploy**.

### Option B: Deploy via Wrangler CLI
From the `web/` directory:
```bash
cd web

# 1. Install Wrangler if needed
npm install -g wrangler

# 2. Login to your Cloudflare account
wrangler login

# 3. Create the project
wrangler pages project create indiabids-web

# 4. Build and deploy
npm run build
wrangler pages deploy .next --project-name=indiabids-web
```

---

## 3. Backend Deployment & Database Setup

The backend persists financial transactions (Razorpay webhook, payments, bids, user claims) to PostgreSQL and syncs sorted set leaderboards to Redis.

### 1. Database Provisioning:
- **PostgreSQL**: Provision a managed PostgreSQL instance (e.g. Neon, Supabase, AWS RDS, or Prisma Postgres).
  - Run database migrations:
    ```bash
    DATABASE_URL="your-postgres-connection-string" npx prisma db push
    ```
  - Seed all 23 real categories and 368 boards:
    ```bash
    DATABASE_URL="your-postgres-connection-string" npx tsx server/src/seed.ts
    ```
- **Redis**: Provision an Upstash Redis instance (low-latency serverless Redis compatible with Cloudflare) or Redis Cloud.
  - Set `REDIS_URL="rediss://default:token@...upstash.io:6379"`

### 2. Backend Environment Variables (`server/.env`):
```env
PORT=4000
NODE_ENV=production
DATABASE_URL="postgresql://user:password@host:5432/indiabids?sslmode=require"
REDIS_URL="rediss://default:token@host:6379"

# Razorpay
RAZORPAY_KEY_ID="rzp_live_..."
RAZORPAY_KEY_SECRET="your_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Auth & Sessions
JWT_ACCESS_SECRET="generate-a-strong-random-64-char-string"
SESSION_COOKIE_SECRET="generate-a-strong-random-64-char-string"
CORS_ORIGIN="https://indiabids.in"
```

### 3. Deploy Backend:
Deploy the backend container or Node.js service to your cloud provider (Render, Railway, Fly.io, AWS ECS, or a VPS).
To proxy backend traffic through Cloudflare:
- Add a DNS record `api.indiabids.in` pointing to your backend server with Cloudflare Proxy (orange cloud) enabled.
- Alternatively, run **Cloudflare Tunnel (`cloudflared`)** to securely route requests from Cloudflare's edge directly to your Node service with zero open inbound firewall ports:
  ```bash
  cloudflared tunnel create indiabids-api
  cloudflared tunnel route dns indiabids-api api.indiabids.in
  cloudflared tunnel run --url http://localhost:4000 indiabids-api
  ```

---

## 4. Webhook Configuration (Razorpay)

In the Razorpay Dashboard:
1. Navigate to **Settings** → **Webhooks**.
2. Add a new webhook URL:
   `https://api.indiabids.in/api/v1/payments/webhooks/razorpay`
3. Select event: `payment.captured`.
4. Set the **Secret** to match `RAZORPAY_WEBHOOK_SECRET`.

---

## 5. Verification Checklist

- [x] All 23 categories seeded in PostgreSQL.
- [x] All 368 National and State boards initialized.
- [x] Redis connected and functioning as leaderboard read model.
- [x] Razorpay webhook idempotency verified (`@@unique([provider, eventId])`).
- [x] Anonymous bid flow verified (one-time `manageToken` generation + hashing at rest).
- [x] Registered user dashboard & claim verified (`/manage/:token/claim`).
- [x] Next.js production build (`npm run build`) passing with zero errors.
