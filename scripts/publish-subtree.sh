#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --workspace <remote-git-url> [branch]"
  echo "This helper will interactively force-push your current workspace branch to the remote branch you choose."
  echo "Subtree exports are deprecated; prefer pushing the full monorepo and deploying services from Render subpaths."
  exit 2
}

if [ "${1:-}" != "--workspace" ]; then
  usage
fi

REMOTE="${2:-}"
BRANCH="${3:-master}"
if [ -z "$REMOTE" ]; then usage; fi

echo "WARNING: This will force-push the current workspace to $REMOTE branch $BRANCH."
read -p "Type 'yes' to proceed: " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

git remote add origin "${REMOTE}" 2>/dev/null || git remote set-url origin "${REMOTE}"
CUR_BRANCH=$(git rev-parse --abbrev-ref HEAD || echo "master")
git push origin "${CUR_BRANCH}:${BRANCH}" --force

echo "[publish] Workspace pushed to ${REMOTE} on branch ${BRANCH}"
