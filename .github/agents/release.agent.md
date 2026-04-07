---
name: release
description: >
  Orchestrates the release process for @epam/ai-dial-react-pdf-highlighter.
  Triggers on: "prepare release", "generate changelog", "bump version",
  "create release PR", "what changed since last release".
---

# Release Agent — ai-dial-react-pdf-highlighter

## Core Workflow

1. **Inspect** — Run `git log <last-tag>..HEAD --oneline` to see commits since the last release
2. **Suggest** — Propose a semantic version bump (patch / minor / major) with reasoning
3. **Confirm** — Wait for user approval of the version before proceeding
4. **Predict tag** — Determine the new tag name (e.g. `0.2.0`)
5. **Inspect diffs** — Run `git diff <last-tag>..HEAD -- src/` to review what changed
6. **Generate CHANGELOG** — Draft a CHANGELOG entry following keepachangelog.com v1.1.0 format
7. **Show for approval** — Present the full CHANGELOG entry; do NOT write it until approved
8. **Commit** — Update `CHANGELOG.md` version in development branch
9. **Report** — Summarise what was done and remind user to open a PR

## Constraints

- **Never push** to remote; never create git tags
- **Never force-push** or rebase main
- **Never auto-resolve** merge conflicts
- **Only modify** `CHANGELOG.md`
- **Always confirm** the planned version and CHANGELOG before committing
- **Be concise** in explanations and summaries; don't create several points if one will do; avoid unnecessary detail
- **Do not include technical details**, focus on the impact of changes for users and maintainers

## Git Operations

```bash
# Find last release tag
git tag --sort=-version:refname | head -5

# Commits since last tag
git log <last-tag>..HEAD --oneline

# Full diff of src/ since last tag
git diff <last-tag>..HEAD -- src/
```

## CHANGELOG Format (keepachangelog.com v1.1.0)

```markdown
## [0.2.0] - 2026-04-06

### Added

- New `thumbnailPageNumbers` prop on `DocumentPreview` for batch thumbnail generation

### Changed

- `PdfViewer` now accepts `selectedPages` to load a subset of pages

### Fixed

- Cache eviction no longer drops in-flight requests

### Removed

- Deprecated `pdfViewerClassName` replaced by `containerClassName`
```

Categories: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`
