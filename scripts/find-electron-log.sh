#!/usr/bin/env bash
set -euo pipefail

# Find and tail Electron main process log written by electron-log
# Checks specific well-known paths per OS (no recursive search)

tail_lines="200"
if [[ "${1:-}" =~ ^[0-9]+$ ]]; then
  tail_lines="$1"
fi

platform="$(uname -s | tr '[:upper:]' '[:lower:]')"

declare -a candidates
if [[ "$platform" == *mingw* || "$platform" == *msys* || "$platform" == *cygwin* ]]; then
  # Windows (Git Bash)
  APP_ROAMING="$(cygpath -u "${APPDATA:-}")"
  APP_LOCAL="$(cygpath -u "${LOCALAPPDATA:-}")"
  [[ -n "$APP_ROAMING" ]] && candidates+=("$APP_ROAMING/Electron/logs/main.log")
  [[ -n "$APP_LOCAL" ]] && candidates+=("$APP_LOCAL/Electron/logs/main.log")
elif [[ "$platform" == *darwin* ]]; then
  # macOS
  candidates+=("$HOME/Library/Logs/Electron/main.log")
else
  # Linux
  candidates+=("$HOME/.config/Electron/logs/main.log")
fi

for p in "${candidates[@]}"; do
  if [[ -f "$p" ]]; then
    echo "Log file: $p"
    tail -n "$tail_lines" "$p"
    exit 0
  fi
done

echo "No Electron main log found. Tried:"
printf ' - %s\n' "${candidates[@]}"
exit 1


