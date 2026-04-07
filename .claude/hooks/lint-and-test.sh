#!/usr/bin/env bash
# PostToolUse hook — runs lint and tests after editing a TS/TSX file.
# Set DISABLE_PDF_HIGHLIGHTER_HOOKS=1 to bypass.

[ -n "$DISABLE_PDF_HIGHLIGHTER_HOOKS" ] && exit 0

input=$(cat)

if echo "$input" | grep -qE '"file_path"\s*:\s*"[^"]+\.(tsx?|jsx?)"'; then
  echo "File edited — running lint and tests..." >&2

  lint_output=$(npm run lint:check 2>&1); lint_exit=$?
  test_output=$(npm run test:run 2>&1); test_exit=$?

  [ $lint_exit -ne 0 ] && { echo "Lint errors:" >&2; echo "$lint_output" >&2; }
  [ $test_exit -ne 0 ] && { echo "Test errors:" >&2; echo "$test_output" >&2; }

  [ $lint_exit -ne 0 ] || [ $test_exit -ne 0 ] && exit 1
fi

exit 0
