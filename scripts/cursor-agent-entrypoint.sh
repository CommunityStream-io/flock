#!/usr/bin/env bash
set -euo pipefail

echo "[cursor-agent] Starting background agent..."

# If GH_TOKEN/GITHUB_TOKEN present, perform non-interactive auth
if [[ -n "${GH_TOKEN:-}${GITHUB_TOKEN:-}" ]]; then
  TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
  echo "[cursor-agent] Authenticating gh using token from env..."
  # shellcheck disable=SC2005
  echo "$TOKEN" | gh auth login --with-token >/dev/null 2>&1 || true
  gh auth status || true
else
  echo "[cursor-agent] No GH_TOKEN/GITHUB_TOKEN provided. Skipping gh auth."
fi

# If a command is passed, run it. Otherwise, idle.
if [[ $# -gt 0 ]]; then
  echo "[cursor-agent] Executing: $*"
  exec "$@"
else
  echo "[cursor-agent] No command provided. Idling (sleep infinity)."
  exec bash -lc "sleep infinity"
fi

