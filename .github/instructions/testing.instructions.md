---
applyTo: '**/*.spec.tsx'
---

## Testing

**Framework**: Vitest with React Testing Library

**Test file naming**: `ComponentName.spec.tsx` co-located with the component

**Test structure**:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('...', { name: '...' })).toBeInTheDocument();
  });
});
```

**Test setup file**: `setupTests.ts` — pre-mocks `IntersectionObserver`, `ResizeObserver`,
and runs `cleanup()` after each test.

**Common patterns**:

- **Providers**: `<DocumentPreviewCacheProvider>` is optional — wrap when you want to test
  caching behaviour; omit it to test the no-cache path:

  ```tsx
  // with cache
  render(
    <DocumentPreviewCacheProvider>
      <MyComponent />
    </DocumentPreviewCacheProvider>,
  );
  // without cache (loadFileCb called directly)
  render(<MyComponent />);
  ```

- **Async state**: Use `waitFor` or `findBy*` for components with async effects:

  ```tsx
  await waitFor(() => expect(screen.getByText('...')).toBeInTheDocument());
  ```

- **Mocking**: Prefer `vi.fn()` for callbacks; mock `@epam/pdf-highlighter-kit` at the
  module level when testing `PDFViewer`:

  ```ts
  vi.mock('@epam/pdf-highlighter-kit', () => ({
    PDFHighlightViewer: vi.fn().mockImplementation(() => ({
      init: vi.fn().mockResolvedValue(undefined),
      loadPDF: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      loadHighlights: vi.fn(),
      setZoom: vi.fn(),
      setPage: vi.fn(),
      goToHighlight: vi.fn(),
      getZoom: vi.fn(() => 1),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      getThumbnailsDataUrl: vi.fn().mockResolvedValue(new Map()),
    })),
    ZoomMode: { AUTO: 'auto', PAGE_FIT: 'page-fit' },
  }));
  ```

- **Query priority**: `getByRole` > `getByLabelText` > `getByTestId`

**Running tests**:

```bash
npm run test:run          # run once, no coverage
npm run test              # run with coverage report
```
