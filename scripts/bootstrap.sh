#!/usr/bin/env bash
set -euo pipefail

echo "[bootstrap] Checking for pnpm and corepack..."

if ! command -v pnpm >/dev/null 2>&1; then
  echo "[bootstrap] pnpm not found. Please install pnpm (npm install -g pnpm) or enable corepack."
  exit 1
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "[bootstrap] corepack not found. You may want to enable it for pnpm version management."
else
  corepack enable || true
fi

echo "[bootstrap] Installing workspace dependencies with pnpm (root)"
pnpm install --frozen-lockfile

echo "[bootstrap] All workspace deps installed. You can run 'pnpm -w dev' or start individual projects."
