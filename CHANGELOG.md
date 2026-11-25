# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- **Breaking:** require `@epam/ai-dial-ui-kit` version `0.17.0-dev.16` or newer for skeleton loading components.

### Fixed

- Preserve `PDFViewer` root sizing through `containerClassName`.
- Keep the PDF loading skeleton visible until the initial zoom and destination page finish rendering.
- Prevent keyboard interaction with the viewer while its loading skeleton is visible.

## [0.1.3] - 2026-04-27

### Fixed

- Improved document preview header alignment so file names display consistently.
