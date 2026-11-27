#!/usr/bin/env bash
set -euo pipefail

echo "==> INDIAbids Production Build & Migration Preflight"

if [ ! -f ".env" ]; then
  echo "ERROR: Root .env missing. Copy .env.example to .env and populate secrets." >&2
  exit 1
fi

echo "==> Installing root dependencies..."
npm ci

echo "==> Generating Prisma Client & deploying migrations..."
npx prisma generate --config prisma7.config.ts
npx prisma migrate deploy --config prisma7.config.ts

echo "==> Building backend API..."
npm run build

echo "==> Installing, linting, typechecking & building frontend..."
cd web
npm ci
npm run lint
npx tsc --noEmit
npm run build

echo "==> Deployment artifacts verified successfully."
