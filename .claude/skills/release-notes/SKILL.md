---
name: release-notes
description: Use when the user asks to enhance, refine, polish, or "look at" the release notes for a tag of @epam/ai-dial-react-pdf-highlighter — typically a freshly cut release. Reads the CI-generated notes off the GitHub release, classifies and rewrites each bullet in this project's editorial voice, and saves a draft to `.claude/release-notes/`. Also identifies whether CHANGELOG.md needs updating for breaking changes. Never edits GitHub directly.
allowed-tools: Read Grep Glob Bash(gh release view:*) Bash(gh release list:*) Bash(gh pr view:*) Bash(gh pr list:*) Bash(gh pr diff:*) Bash(git log:*) Bash(git show:*) Bash(git diff:*) Bash(git tag:*) Bash(git rev-parse:*) Bash(date:*) Write(.claude/release-notes/*)
argument-hint: '[tag]'
arguments: tag
model: opus
effort: xhigh
context: fork
agent: general-purpose
---

# @epam/ai-dial-react-pdf-highlighter — release-notes enhancer

This repo's release CI (the shared `epam/ai-dial-ci` `node_release.yml` workflow, wired in
`.github/workflows/release.yml`) publishes a GitHub release for every tag with bullets that are
the raw PR titles. Those bullets carry noise — conventional-commit prefixes (`feat:`, `fix:`,
`chore:`), issue refs, and an `## Other` bucket that mixes real dependency/security bumps with
pure CI/tooling churn (`[skip ci] ...`, `Release (#N)`, dependabot groups). This skill reproduces
the human editorial pass that turns those raw notes into something a consumer of the package
would actually want to read.

You are running in a forked, isolated context. Read and research freely — only the final summary
you return reaches the main conversation. All file writes happen in this fork; the draft lands at
`.claude/release-notes/<tag>-draft.md`.

## When to use

- "Enhance the release notes for `0.1.4`"
- "Look at the latest release notes and refine them"
- "The CI just published `<tag>`, make it readable"
- "Polish the release notes for the current tag"

Do **not** trigger on requests like "what changed in `0.1.4`?" — that is a recall question, not a
notes-editing task.

## Inputs

`tag` = `$tag` — the GitHub release tag to enhance (e.g. `0.1.4`). If empty, pick the most recent
tag from `gh release list --limit 5` and confirm with the user before editing.

This package has cut several stable releases already (`0.1.0`–`0.1.4` as of writing,
`package.json` version tracks the latest). Always try to anchor style against the immediately
preceding release (step 1.3) — don't skip it as you might for a first release.

## Workflow

### 1. Resolve target and reference styles

1. `gh release view <tag> --json body,name,tagName` — capture the raw CI notes.
2. `gh release list --limit 10` — locate the previous release.
3. `gh release view <prev-tag> --json body` — use it as a style anchor, matching terseness (one
   line per bullet).
4. `git log <prev-tag>..<tag> --oneline` — full commit list for the range, to spot commits the CI
   dropped or squash-merged without a clean PR title.

### 2. Pull source context for each bullet

For every bullet in the raw notes:

1. Parse out the trailing `(#<PR>)`. This repo's PR titles are flat Conventional Commits —
   `feat: add rotation support (#25)`, `fix: Don't show error if fileName is not passed (#46)` —
   without per-component scope prefixes, and issue numbers are rare.
2. `gh pr view <PR> --json title,body,labels` — read the PR body for the _why_; the title alone is
   often just the commit subject.
3. For bullets without a PR number (e.g. `Release (#9)`, `[skip ci] chore: update CODEOWNERS
   file`, `Empty commit`, `format package.json`), find the matching commit with
   `git log <range> --oneline | grep -i <keywords>` and `git show <hash>` if there's any doubt
   about consumer relevance — most of these turn out to be pure noise (see §4).

**Dependency-bump PRs:** This repo has a heavy stream of dependabot/renovate-style bumps —
`chore: bump the ai-dial-ci group with 3 updates`, `chore: bump shell-quote and concurrently`,
`chore: bump hono from 4.12.18 to 4.12.25`, `chore: bump js-yaml from 4.1.1 to 4.2.0` — most of
which are dev-only tooling with zero runtime impact for a consumer of the published library
(`hono`/`qs`/`express-rate-limit` etc. come in via the MCP dev server and CI tooling, not the
shipped `dist/`). Treat these as noise **unless** the PR title/body flags a CVE or security
advisory (e.g. `chore: bump ip-address and express-rate-limit (#29)` when it's fixing a known
vulnerability) — those stay, folded into `Fixes`.

### 3. Check CHANGELOG.md for breaking changes

Before writing the draft, read `CHANGELOG.md`. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) with `### Added` / `### Changed` /
`### Fixed` / `### Removed` subsections under each version heading. `CONTRIBUTING.md` only asks
contributors to "mention breaking changes clearly in PR description" — there is no hard CI gate
requiring a CHANGELOG entry, so don't assume one exists just because a change is breaking.

- If the raw release notes contain a change that removes/renames a public export from
  `src/index.ts` (e.g. `PDFViewer`, `DocumentPreview`, `DocumentPreviewCacheProvider`,
  `PdfPreviewLoader`, `PageThumbnail`) or alters `PdfViewerProps` / `DocumentPreviewProps` /
  `PdfPreviewLoaderProps` / `PageThumbnailProps` or other public prop shapes, confirm it's called
  out in `CHANGELOG.md` under the matching version with enough guidance for a consumer to migrate.
- If such a breaking change appears in the raw release notes but **not** in `CHANGELOG.md`, note
  this in the editorial file as an open question — the user needs to add the CHANGELOG entry
  before the release is complete.

### 4. Classify each bullet

The raw CI's `## Features` / `## Fixes` / `## Other` partition is unreliable (this repo's recent
releases don't even surface a `## Tests` section, but treat one the same way if it appears).
Reclassify by actual consumer impact:

| Where CI put it                            | Where it belongs | Rule                                   |
| ------------------------------------------- | ----------------- | --------------------------------------- |
| `Other` starting with `feat:`               | `Features`         | A feat that lost its slot.              |
| `Other` starting with `fix:`                | `Fixes`            | Same, for fix.                          |
| `Tests` — any entry                         | **Drop**           | Zero consumer impact.                   |
| Multiple PRs on the same component/feature  | one folded entry   | Cite PR numbers in parens.              |
| `Other` for a security dep bump (CVE)       | `Fixes`            | Security items are consumer-relevant.   |
| `Other` for CI-only trusted-publishing setup (`add id-token: write`, `bump CI version to use trusted publishing`) | **Drop** | No consumer-visible effect. |

**Drop these entirely** — no consumer-visible effect:

- All `## Tests` entries, if present (added/updated unit tests, coverage work, Storybook story
  additions that only cover existing behavior).
- Release-mechanics commits: `Release (#N)`, `Release 1 (#N)`, `Empty commit`, `[skip ci] ...`,
  `format package.json`, CODEOWNERS updates.
- CI/tooling-only changes: workflow renames, `bump CI version to use trusted publishing`,
  `add id-token: write for trusted publishing`, dependabot-group bumps for `ai-dial-ci`.
- Routine dev-dependency bumps that aren't security-relevant (`shell-quote`, `concurrently`,
  `hono`, `qs`, `postcss`, `fast-uri`, `js-yaml`, MCP-server-only deps) unless the user wants a
  full dependency ledger.
- Pure internal refactors, renames, test-only changes, `Merge remote-tracking` commits.

**Keep in `Other`** — items consumers or maintainers care about:

- Security-adjacent dependency bumps (CVE fixes — e.g. `ip-address`/`express-rate-limit`,
  `brace-expansion` when flagged as a Trivy/security fix).
- Peer dependency changes to `@epam/ai-dial-ui-kit`, `@epam/pdf-highlighter-kit`, or React that
  affect what consumers must install.
- Significant dev tooling that affects contributors (e.g. new Storybook capability, new required
  Node/npm version).

**Flag as `[Breaking]`** — items that require consumer code changes:

- Renamed/removed exports from `src/index.ts`, changed `PdfViewerProps` / `DocumentPreviewProps` /
  other public prop shapes, altered zoom/rotation/highlight-navigation contracts, removed hooks
  (`useDocumentPreview`, `useDocumentPreviewCache`).
- Include migration guidance inline: `(#<PR>) — migrate by <one-line instruction>`.

If unsure whether to keep a bullet: _would someone consuming `@epam/ai-dial-react-pdf-highlighter`
reading these notes care?_ If no, drop it.

### 5. Rewrite each kept bullet

Raw form: `feat: description (#NNN)` or `fix: description (#NNN)`. Rewrite to:

```
* <Active-voice description of what changed> — <brief why-it-matters> (#<PR>)
```

Rules in order of importance:

1. **One line per bullet.** No multi-paragraph descriptions.
2. **Drop the conventional prefix** (`feat:`, `fix:`, `chore:`, `refactor:`). Replace with prose.
3. **Use a `—` em-dash for the "why" clause**, not a hyphen or colon.
4. **Backticks for code identifiers**: exported component names (`` `PDFViewer` ``,
   `` `DocumentPreview` ``, `` `PdfPreviewLoader` ``, `` `PageThumbnail` ``), prop names
   (`` `onViewerReady` ``, `` `autoFocusFirstHighlight` ``), hook names
   (`` `useDocumentPreview` ``), type/enum names (`` `RotationDirection` ``).
5. **Preserve PR refs at the end** in `(#<PR>)` form. For grouped entries list all PRs:
   `(#8, #10, #13)`.
6. **Prefix with `[Breaking]`** for breaking changes; state the migration inline.
7. **Flag regressions explicitly**: `(regression fix)` for items restoring previously-working
   behavior.
8. **Quote CVE IDs verbatim** for security upgrades.
9. **For new exported components/hooks**, lead with the name in backticks:
   `` `PageThumbnail` added — ... ``.

#### Example transformations (this project's patterns)

```
# New feature, active voice:
- * feat: update pdf library with rotation functionality (#25)
+ * Added page-rotation support via `RotationDirection` / `PageRotationDegrees` (#25)

# Component-scoped fix, kept literal component tag:
- * fix: (PdfViewer) defer highlight navigation until initial zoom resolves (#24)
+ * `PDFViewer` now defers highlight navigation until the initial zoom resolves — fixes premature jumps on load (#24)

# Dropping the conventional prefix, em-dashing the why:
- * fix: Don't show error if fileName is not passed (#46)
+ * `DocumentPreview` no longer shows an error when `fileName` is omitted (#46)

# Security-relevant dependency bump, kept and reclassified into Fixes:
- * bump ip-address and express-rate-limit (#29)
+ * Bumped `ip-address`/`express-rate-limit` to address a reported SSRF advisory (#29)

# Breaking change with inline migration note:
- * feat: rename `PdfViewerProps.onReady` to `onViewerReady` (#NNN)
+ * [Breaking] `PdfViewerProps.onReady` renamed to `onViewerReady` (#NNN) — update the prop name; signature is unchanged

# Dropping release-mechanics noise:
- * Release (#9)  ← drop entirely
- * [skip ci] chore: update CODEOWNERS file  ← drop entirely
- * format package.json  ← drop entirely

# Dropping CI/tooling noise:
- * add id-token: write for trusted publishing  ← drop (CI-only)
- * bump CI version to use trusted publishing and fix npm script publish  ← drop (CI-only)

# Dropping routine dev-dependency bumps:
- * bump the ai-dial-ci group with 3 updates (#30)  ← drop
- * chore: bump shell-quote and concurrently (#42)  ← drop
- * chore: bump hono from 4.12.18 to 4.12.25 (#37)  ← drop (dev-only, non-security)
```

### 6. Save the draft (and optional editorial companion)

Write:

- **`.claude/release-notes/<tag>-draft.md`** — the final notes, ready to paste into the GitHub
  release body. No preamble or commentary — just headings and bullets.
- **`.claude/release-notes/<tag>-editorial-notes.md`** _(optional, only when useful)_ —
  non-obvious calls worth surfacing:
  - Grouping decisions (which PRs were folded and why).
  - Items dropped, with one-line reason each.
  - Open questions (missing CHANGELOG entry for a breaking change, ambiguous classification, an
    unrecognized dependency).

### 7. Verify nothing was pushed to GitHub

This skill **never** runs `gh release edit`, `gh release create`, or any write operation against
the repo. Drafts only.

## Output format

The file saved to `.claude/release-notes/<tag>-draft.md` follows this shape exactly (including
`---` separators, which match the CI format):

```markdown
## Features

- <one bullet per change or group>

---

## Fixes

- <one bullet per change>

---

## Other

- <only consumer- or maintainer-relevant items>
```

Omit any section that has no entries. Do **not** include a `## Tests` section. Section order:
`Features` → `Fixes` → `Other`.

Breaking changes appear at the **top of `Features`** (or `Fixes` if it is only a behavioral
correction), prefixed with `[Breaking]`.

## Return to the main conversation

Return a short summary — five lines or fewer:

- The draft path (`.claude/release-notes/<tag>-draft.md`).
- Counts of bullets per section after enhancement and grouping.
- Groupings that happened (e.g. "folded the zoom-timing fix into the rotation feature bullet").
- Reclassifications (e.g. "moved 1 from Other → Fixes").
- Items dropped (count, with one example).
- Whether any breaking changes were found, and if their CHANGELOG.md entries exist.
- Any open questions (missing migration note, ambiguous item, unrecognized dependency).

Example:

> Drafted `.claude/release-notes/0.1.4-draft.md`. 1 Feature, 2 Fixes, 0 Other. Reclassified 1 item
> (Other → Fixes: trusted-publishing `id-token` grant folded into release-fix bullet). Dropped 18
> items (dependabot/renovate dependency-group bumps, CI trusted-publishing chores). No breaking
> changes detected.

## Safety rails

- **Never edit GitHub.** No `gh release edit`, no `gh release create`. Drafts only.
- **Never invent items.** Every kept bullet maps to a PR or a commit hash in the range.
- **Never silently drop a PR reference.** The bullet ends with the canonical `(#<PR>)` refs.
- **Match the terseness of the predecessor's notes.**

## Maintenance

If you notice a pattern in the raw CI notes that this skill doesn't handle (a new CI section, a
recurring rewrite the user keeps requesting, a dependency category that misroutes), surface it in
your return summary and offer to update this `SKILL.md`. The user can confirm before any edit
lands.
