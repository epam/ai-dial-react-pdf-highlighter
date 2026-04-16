import type { Meta, StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';

import { DocumentCacheProvider } from '@/context/documentCacheProvider';
import { PageThumbnail } from '@/components/PageThumbnail/PageThumbnail';
import type { PdfViewerApi } from '@/models/pdf-viewer.models';
import { sampleHighlights } from '@/constants/storybook';
import { DocumentPreview } from './DocumentPreview';

const SAMPLE_PDF_URL = '/pdf_sample.pdf';

/**
 * `DocumentPreview` is the high-level PDF viewer with a built-in toolbar:
 * zoom selector, step zoom buttons, and an occurrence counter.
 *
 * It must be wrapped in `<DocumentPreviewCacheProvider>`.
 */
const meta: Meta<typeof DocumentPreview> = {
  title: 'Components/DocumentPreview',
  component: DocumentPreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: [
          'High-level viewer with optional `fileName`, toolbar (zoom, occurrences, title). Fetches and caches the PDF',
          'via the caller-supplied `loadFileCb`. Must be wrapped in `<DocumentPreviewCacheProvider>`.',
        ].join(' '),
      },
    },
  },
  decorators: [
    (Story) => (
      <DocumentCacheProvider>
        <Story />
      </DocumentCacheProvider>
    ),
  ],
  argTypes: {
    showOccurrences: { control: 'boolean' },
    showLoaderOverlay: { control: 'boolean' },
  },
} satisfies Meta<typeof DocumentPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Basic viewer with an occurrence counter and no title. The PDF is fetched via' +
          ' `loadFileCb` and cached by the surrounding `DocumentPreviewCacheProvider`.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    showOccurrences: true,
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const WithTitle: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Shows optional `fileName` above the toolbar and a document title in the centre,' +
          ' ellipsed when either overflows.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    fileName: 'pdf_sample.pdf',
    title: 'PDF Techniques for WCAG 2.1',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const WithOccurrences: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Occurrence counter wired to a set of highlights. Use the chevron buttons to' +
          ' navigate between matches.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: sampleHighlights,
    showOccurrences: true,
    occurrencesLabel: 'Matches',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const LoadingOverlay: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates `showLoaderOverlay=true`, which keeps the animated skeleton' +
          ' visible while the parent application is busy (e.g. awaiting search results).',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    showLoaderOverlay: true,
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const ErrorState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'When `loadFileCb` rejects, the viewer switches to an error state and renders' +
          ' `errorLabel`.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: () => Promise.reject(new Error('Network error')),
    highlights: [],
    errorLabel: 'Could not load the document. Please try again.',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const UnsupportedFile: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Non-PDF URLs are rejected before any network request is made.' +
          ' `unsupportedLabel` is shown instead of the generic error message.',
      },
    },
  },
  args: {
    fileUrl: 'https://example.com/document.docx',
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    unsupportedLabel: 'Only PDF files are supported.',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

export const NoOccurrencesBar: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass `showOccurrences=false` to hide the occurrence counter and get a clean' +
          ' toolbar with just zoom controls.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    showOccurrences: false,
    title: 'Clean Viewer (no occurrences bar)',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

/** Same as hiding the occurrences bar, but with several highlights (for dimming / selection behaviour). */
export const NoOccurrencesBarWithHighlights: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`showOccurrences=false` with multiple `highlights` — useful to verify that the viewer' +
          ' does not treat a hidden “current occurrence” as selected.',
      },
    },
  },
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: sampleHighlights,
    showOccurrences: false,
    title: 'No occurrences bar, multiple highlights',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Demonstrates incremental thumbnail generation via `thumbnailPageNumbers` +
 * `onThumbnailsLoaded`. The viewer renders pages 1–5 and thumbnails are
 * generated in batches. Each resolved thumbnail appears in the strip below
 * the viewer as soon as its batch is ready.
 */
const ThumbnailGenerationDemo = (
  args: React.ComponentProps<typeof DocumentPreview>,
) => {
  const [thumbnails, setThumbnails] = useState<Map<number, string>>(new Map());
  const [activePage, setActivePage] = useState<number | undefined>(1);
  const apiRef = useRef<PdfViewerApi | null>(null);

  const handleThumbnailClick = (page: number) => {
    setActivePage(page);
    apiRef.current?.navigateToPage(page);
  };

  return (
    <DocumentCacheProvider>
      <div className="flex flex-row h-[700px] gap-3 bg-layer-1">
        <div className="flex flex-col overflow-y-auto gap-2 bg-layer-2 rounded-sm flex-shrink-0 p-2">
          {thumbnails.size === 0 && (
            <span className="self-center text-xs text-secondary p-2">
              Thumbnails loading…
            </span>
          )}
          {Array.from(thumbnails.entries()).map(([page, url]) => (
            <PageThumbnail
              key={page}
              pageNum={page}
              thumbnailUrl={url}
              isSelected={activePage === page}
              isLoading={false}
              onSelectPage={handleThumbnailClick}
            />
          ))}
        </div>

        <div className="flex-1 min-w-0">
          <DocumentPreview
            {...args}
            onThumbnailsLoaded={(map) => setThumbnails(new Map(map))}
            onViewerReady={(api) => {
              apiRef.current = api;
            }}
          />
        </div>
      </div>
    </DocumentCacheProvider>
  );
};

export const ThumbnailGeneration: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Pass `thumbnailPageNumbers` to request thumbnail images and `onThumbnailsLoaded` to receive them incrementally as each batch resolves. ' +
          'Click a thumbnail to jump to that page via the `navigateToPage` method exposed through `onViewerReady`.',
      },
    },
  },
  render: (args) => <ThumbnailGenerationDemo {...args} />,
  decorators: [],
  args: {
    fileUrl: SAMPLE_PDF_URL,
    loadFileCb: (url) => fetch(url).then((r) => r.blob()),
    highlights: [],
    showOccurrences: false,
    title: 'Thumbnail Generation Demo',
    thumbnailPageNumbers: [1, 2, 3],
  },
};
