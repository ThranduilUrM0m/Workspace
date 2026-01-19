#!/usr/bin/env bash
set -euo pipefail
if [ -d .git ]; then
  echo "[git-init] Git already initialized; skipping."
  exit 0
fi
git init
git checkout -b master
git add -A
git commit -m "chore: initial scaffolded monorepo"
echo "[git-init] git repository initialized and initial commit created on 'master' branch."
