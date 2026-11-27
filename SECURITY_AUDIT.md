# INDIAbids Security & Payment Audit Report

**Audit Date:** November 2026  
**Scope:** Express API (`server/src`), Prisma Schema (`prisma/schema.prisma`), Razorpay Payment & Webhook Pipeline, and Next.js Checkout Client (`web/`).

---

## Executive Summary

A full source-level security and payment architecture audit was performed across authentication, bidding, business management, Razorpay order creation, webhook reconciliation, and client checkout verification. **7 vulnerabilities / payment reliability gaps** were identified and remediated directly in code.

---

## Findings & Remediations

### 1. [HIGH] IDOR / Unauthorized Bidding on Existing Listings
- **Location:** `server/src/modules/bidding/bidding.service.ts` (`placeBid`), `server/src/modules/boards/membership.service.ts` (`joinBoard`)
- **Vulnerability:** When `businessId` was supplied without `manageToken`, `placeBid` only checked `if (userId && business.ownerId && business.ownerId !== userId)`. Anonymous callers (`userId === null`) or authenticated users targeting an unclaimed listing (`business.ownerId === null`) could create payments and bids on businesses they did not own. Similarly, `joinBoard` did not verify `business.ownerId === userId`.
- **Fix:** Enforced strict ownership checks: `businessId` requires an active authenticated session (`userId !== null`) where `business.ownerId === userId` and `business.status === "ACTIVE"`. Anonymous updates strictly require a valid `manageToken`.

### 2. [HIGH] Public PII Disclosure on Business Profile Lookup
- **Location:** `server/src/modules/businesses/business.service.ts` (`getPublicBusinessBySlug`)
- **Vulnerability:** `GET /api/v1/businesses/:slug` shared `businessSelect`, exposing `contactEmail`, `contactPhone`, and `ownerId` publicly.
- **Fix:** Introduced `publicBusinessSelect` omitting `contactEmail`, `contactPhone`, and `ownerId` for public slug lookups.

### 3. [HIGH] Razorpay Checkout Verification Missing & Silent Order Fallback
- **Location:** `web/app/bid/bid-form.tsx`, `web/app/manage/[token]/page.tsx`, `server/src/modules/bidding/bidding.service.ts`
- **Vulnerability:**
  1. Frontend Razorpay `handler` ignored `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }` and never called `POST /api/v1/payments/verify`, leaving payments stuck `PENDING` if webhooks were delayed or unreachable in local/preview environments.
  2. Backend `placeBid` silently swallowed Razorpay `orders.create` errors and generated fake local `order_...` IDs, causing Razorpay Checkout to fail at runtime in production.
- **Fix:**
  1. Typed `RazorpaySuccessResponse` in `web/api/razorpay.ts` and wired `POST /api/v1/payments/verify` inside Razorpay `handler` in both `bid-form.tsx` and `manage/[token]/page.tsx`.
  2. Updated `placeBid` to fail loudly (`502 PAYMENT_GATEWAY_ERROR`) and mark the local payment `FAILED` whenever `razorpay.orders.create` fails outside `NODE_ENV === "test"`.

### 4. [HIGH] Non-Atomic Webhook Event Recording & Missing Amount/Currency Check
- **Location:** `server/src/modules/payments/payment.webhook.controller.ts`, `server/src/modules/payments/payment.service.ts`
- **Vulnerability:**
  1. `paymentWebhookEvent` was inserted before `reconcileCapturedPayment`; if reconciliation rolled back, Razorpay retries were ignored as duplicates and payments were lost.
  2. `reconcileCapturedPayment` did not assert `input.amountPaise === payment.amountPaise` or `input.currency === payment.currency`.
- **Fix:** Moved `paymentWebhookEvent.create` inside the same ACID `prisma.$transaction` as `Payment -> Bid -> BoardMembership`, added strict amount/currency equality checks, rejected refunded orders, and added rate limiting to `POST /api/v1/payments/verify`.

### 5. [HIGH] `requireSameOrigin` Broken for Multi-Origin `CORS_ORIGIN`
- **Location:** `server/src/middleware/require-same-origin.ts`
- **Vulnerability:** Compared `origin !== env.CORS_ORIGIN` as a raw string, breaking `/auth/*` routes whenever multiple comma-separated origins were configured.
- **Fix:** Parsed comma-separated `CORS_ORIGIN` values and added `referer` fallback validation.

### 6. [MEDIUM] Stored XSS Risk via Unvalidated `website` URL in Bidding Schema
- **Location:** `server/src/modules/bidding/bidding.schemas.ts`
- **Vulnerability:** `placeBidSchema.website` accepted arbitrary strings (including `javascript:` URIs) rendered on leaderboards.
- **Fix:** Enforced `http:`/`https:` URL validation without embedded credentials, matching `business.schemas.ts`.

### 7. [MEDIUM] Concurrent Claim Race & Unthrottled `/manage/:token`
- **Location:** `server/src/modules/businesses/business.service.ts`, `server/src/app.ts`, `server/src/modules/auth/auth.services.ts`, `server/src/lib/logger.ts`
- **Vulnerability:**
  1. `claimBusinessByManageToken` performed non-atomic `findUnique` + `update`.
  2. `/api/v1/manage/:token` lacked rate limiting.
  3. `auth.services.ts` imported `env` from `node:process` instead of `../../config/env`, bypassing Zod defaults.
- **Fix:** Made `claimBusinessByManageToken` atomic via `prisma.$transaction` + conditional `updateMany`, added `manageLimiter` in `app.ts`, fixed `env` import in `auth.services.ts`, and expanded Pino `redact` keys (`x-manage-token`, `manageToken`, `googleId`, Razorpay secrets).

---

## Production Hardening Checklist
- **Secrets Management:** Store `.env` secrets (`DATABASE_URL`, `ACCESS_TOKEN_SECRET`, `RAZORPAY_*`, `GOOGLE_CLIENT_SECRET`) in Vercel/Cloudflare/Zoho Vault or AWS Secrets Manager; never commit `.env`.
- **WAF / Edge Protection:** Enable Cloudflare WAF / Bot Fight Mode in front of `api.indiabids.in` with rate-limit rules on `/api/v1/auth/*` and `/api/v1/bids`.
- **Database Migrations:** Always run `npx prisma migrate deploy --config prisma7.config.ts` in CI/CD before starting the API server.
