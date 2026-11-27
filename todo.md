# Production Readiness Tracker

## Completed in Codebase
- [x] **Security**: Stricter multi-origin CORS (`methods`, `allowedHeaders`, `maxAge`), fixed `requireSameOrigin` for multi-origin support, added Helmet security headers (`referrerPolicy`, `crossOriginResourcePolicy`), rate-limited `/manage/:token` & `/payments/verify`, fixed IDOR on `placeBid`/`joinBoard`, removed PII leak on public business profiles, added URL protocol validation, and documented findings in [`SECURITY_AUDIT.md`](SECURITY_AUDIT.md).
- [x] **Error Handling**: Structured error handler with optional Sentry error shipping via `SENTRY_DSN` in `server/src/lib/error-tracker.ts`.
- [x] **Containerization**: Production multi-stage `Dockerfile` (API), `web/Dockerfile` (Next.js), `.dockerignore`, and `docker-compose.yml` (Postgres 16 + Redis 7 + API + Web).
- [x] **CI/CD**: Automated GitHub Actions pipeline in `.github/workflows/ci-cd.yml` (backend build, frontend lint/typecheck/build, `prisma migrate deploy` step).
- [x] **Database Management**: Added `db:migrate:deploy` script (`prisma migrate deploy --config prisma7.config.ts`) and documented migration + backup strategy.
- [x] **Concurrency & Transactions**: Atomic `prisma.$transaction` across `PaymentWebhookEvent -> Payment -> Bid -> BoardMembership`, atomic `claimBusinessByManageToken`, strict amount/currency equality checks, plus `server/src/test.concurrency.ts` (`npm run test:concurrency`).
- [x] **Automated Deployment Script**: Added `scripts/deploy.sh` running preflight checks, migrations, backend build, and frontend lint/typecheck/build.

## External Infrastructure Setup (At Hosting Time)
- [ ] **WAF & Edge Rules**: Enable Cloudflare WAF / DDoS rules in front of `api.indiabids.in` and `indiabids.in`.
- [ ] **Centralized Log Shipping**: Connect Datadog / Logtail collector to stdout JSON logs from `pino-http`.
- [ ] **Secret Manager & DB Backups**: Store production `.env` secrets in host vault / secret manager and enable automated daily PostgreSQL snapshots.
