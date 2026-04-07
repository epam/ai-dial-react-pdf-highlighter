#!/usr/bin/env bash
# PreToolUse hook — blocks reading secret env files.
# Set DISABLE_PDF_HIGHLIGHTER_HOOKS=1 to bypass.

[ -n "$DISABLE_PDF_HIGHLIGHTER_HOOKS" ] && exit 0

input=$(cat)

if echo "$input" | grep -qE '\.env\.local|\.env\.production|\.env\.secret'; then
  echo "Blocked: reading secret env files is forbidden by project hooks." >&2
  exit 2
fi

exit 0
