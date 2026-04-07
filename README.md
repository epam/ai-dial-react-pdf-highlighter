# @epam/ai-dial-react-pdf-highlighter

AI DIAL React PDF Highlighter is a React component library for PDF viewing and highlights.
It builds on top of [@epam/pdf-highlighter-kit](https://github.com/epam/pdf-highlighter-kit)
and uses [@epam/ai-dial-ui-kit](https://github.com/epam/ai-dial-ui-kit) styles and components.

Part of the [AI DIAL ecosystem](https://github.com/epam/ai-dial).

[![npm version](https://badge.fury.io/js/@epam%2Fai-dial-react-pdf-highlighter.svg)](https://badge.fury.io/js/@epam%2Fai-dial-react-pdf-highlighter)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Table of Contents

- [Highlights](#highlights)
- [Documentation](#documentation)
- [Quick Start](#quick-start)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Peer Dependencies](#peer-dependencies)
  - [Basic Usage](#basic-usage)
- [Exported API](#exported-api)
- [Styles](#styles)
- [Development](#development)
  - [Setup](#setup)
  - [Quality Checks](#quality-checks)
- [Storybook](#storybook)
- [Usage in Projects](#usage-in-projects)
  - [Next.js](#nextjs)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Highlights

- React components for PDF viewing, thumbnailing, and highlights
- Higher-level API over pdf-highlighter-kit
- Built with TypeScript and strict typing
- Storybook + Vitest test setup
- Ready to publish and consume as an npm package

## Documentation

You can explore components in Storybook during local development.

```bash
npm run storybook
```

## Quick Start

### Prerequisites

- Node.js >= 22.2.0
- npm >= 10.7.0

### Installation

```bash
npm install @epam/ai-dial-react-pdf-highlighter
```

### Peer Dependencies

```bash
npm install react react-dom \
  @epam/ai-dial-ui-kit \
  @epam/pdf-highlighter-kit \
  @tabler/icons-react \
  pdfjs-dist
```

Your `pdfjs-dist` version should satisfy [pdf-highlighter-kit requirements](https://github.com/epam/pdf-highlighter-kit?tab=readme-ov-file#requirements).

### Basic Usage

```tsx
import {
  DocumentPreview,
  DocumentPreviewCacheProvider,
} from '@epam/ai-dial-react-pdf-highlighter';
import '@epam/ai-dial-ui-kit/styles.css';
import '@epam/ai-dial-react-pdf-highlighter/styles.css';

function App() {
  return (
    <DocumentPreviewCacheProvider>
      <DocumentPreview
        fileUrl="https://example.com/document.pdf"
        loadFileCb={(url) => fetch(url).then((response) => response.blob())}
        highlights={[]}
      />
    </DocumentPreviewCacheProvider>
  );
}
```

## Exported API

Main exports:

- `PDFViewer`
- `DocumentPreview`
- `DocumentPreviewCacheProvider`
- `useDocumentPreviewCache`
- `PdfPreviewLoader`
- `PageThumbnail`
- `isPdfFile`
- `getStepZoomOptionValue`

There are also zoom-related constants and types exported from the package entrypoint.

## Styles

Import both stylesheets in your app entry point:

```ts
import '@epam/ai-dial-ui-kit/styles.css';
import '@epam/ai-dial-react-pdf-highlighter/styles.css';
```

## Development

### Setup

```bash
git clone https://github.com/epam/ai-dial-react-pdf-highlighter.git
cd ai-dial-react-pdf-highlighter
npm install
```

Useful commands:

```bash
npm run dev
npm run storybook
npm run test:run
npm run test
```

### Quality Checks

Before opening a PR, run:

```bash
npm run typecheck
npm run lint:check
npm run test:run
```

Or run the combined check:

```bash
npm run verify:agent-hook
```

## Storybook

Development mode:

```bash
npm run storybook
```

Production build:

```bash
npm run build-storybook
```

## Usage in Projects

### Next.js

In some cases, PDF-related UI works only with dynamic imports on the client side.
If you hit SSR issues, load viewer components with `next/dynamic` and `ssr: false`.

## Contributing

Please read the [contributing guide](./CONTRIBUTING.md).

## Security

If you find a vulnerability, please read our [security policy](./SECURITY.md).

## License

[Apache 2.0](./LICENSE) © EPAM Systems
