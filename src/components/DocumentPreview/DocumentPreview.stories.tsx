import type { Meta, StoryObj } from '@storybook/react-vite';
import { DialButton, ElementSize, mergeClasses } from '@epam/ai-dial-ui-kit';
import type { InputHighlightData } from '@epam/pdf-highlighter-kit';
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

// =============================================================================
// Document Switcher Demo
// Reproduces the scenario where a table of results drives the PDF preview:
// clicking a row switches the document and navigates to a specific highlighted
// page.
// =============================================================================

const DOC_1_URL = '/pdf_sample.pdf';
// Same underlying PDF, different URL so the cache treats it as a separate file
// and re-initialises the viewer — identical to a real two-document scenario.
const DOC_2_URL = '/pdf_sample.pdf?doc=2';

const doc1Highlights: InputHighlightData[] = [
  {
    id: 'doc1-h1',
    bboxes: [{ x1: 180, y1: 110, x2: 340, y2: 130, page: 1 }],
    style: { backgroundColor: '#ff6b6b', opacity: 0.45 },
    label: 'Doc 1 – p1',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
  {
    id: 'doc1-h2',
    bboxes: [{ x1: 35, y1: 263, x2: 580, y2: 298, page: 2 }],
    style: { backgroundColor: '#4ecdc4', opacity: 0.45 },
    label: 'Doc 1 – p2',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
  {
    id: 'doc1-h3',
    bboxes: [{ x1: 35, y1: 400, x2: 205, y2: 410, page: 3 }],
    style: { backgroundColor: '#ffe66d', opacity: 0.45 },
    label: 'Doc 1 – p3',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
];

const doc2Highlights: InputHighlightData[] = [
  {
    id: 'doc2-h1',
    bboxes: [{ x1: 105, y1: 200, x2: 345, y2: 220, page: 1 }],
    style: { backgroundColor: '#9d50ff', opacity: 0.45 },
    label: 'Doc 2 – p1',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
  {
    id: 'doc2-h2',
    bboxes: [{ x1: 35, y1: 298, x2: 195, y2: 360, page: 2 }],
    style: { backgroundColor: '#ff8c00', opacity: 0.45 },
    label: 'Doc 2 – p2',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
  {
    id: 'doc2-h3',
    bboxes: [{ x1: 125, y1: 700, x2: 320, y2: 715, page: 1 }],
    style: { backgroundColor: '#03c04a', opacity: 0.45 },
    label: 'Doc 2 – p1 (2nd)',
    labelStyle: {
      fontSize: '10px',
      backgroundColor: 'white',
      padding: '1px 3px',
      borderRadius: '2px',
      whiteSpace: 'nowrap',
    },
    isLabelScalable: true,
  },
];

interface TableRow {
  label: string;
  fileUrl: string;
  highlightId: string;
  highlights: InputHighlightData[];
}

const TABLE_ROWS: TableRow[] = [
  {
    label: 'Document 1 — Page 1',
    fileUrl: DOC_1_URL,
    highlightId: 'doc1-h1',
    highlights: doc1Highlights,
  },
  {
    label: 'Document 1 — Page 2',
    fileUrl: DOC_1_URL,
    highlightId: 'doc1-h2',
    highlights: doc1Highlights,
  },
  {
    label: 'Document 1 — Page 3',
    fileUrl: DOC_1_URL,
    highlightId: 'doc1-h3',
    highlights: doc1Highlights,
  },
  {
    label: 'Document 2 — Page 1',
    fileUrl: DOC_2_URL,
    highlightId: 'doc2-h1',
    highlights: doc2Highlights,
  },
  {
    label: 'Document 2 — Page 2',
    fileUrl: DOC_2_URL,
    highlightId: 'doc2-h2',
    highlights: doc2Highlights,
  },
  {
    label: 'Document 2 — Page 1 (2nd hit)',
    fileUrl: DOC_2_URL,
    highlightId: 'doc2-h3',
    highlights: doc2Highlights,
  },
];

const DocumentSwitcherDemoComponent = () => {
  const [activeRow, setActiveRow] = useState<TableRow>(TABLE_ROWS[0]);

  // Strip any query param so both "documents" fetch the same physical file.
  const loadFileCb = (url: string) =>
    fetch(url.split('?')[0]).then((r) => r.blob());

  return (
    <DocumentCacheProvider>
      <div className="flex h-[700px] gap-0 bg-layer-1">
        {/* Left panel — simulated results table */}
        <div className="flex flex-col shrink-0 w-64 border-r border-divider bg-layer-2 overflow-y-auto p-2 gap-1">
          <p className="dial-tiny-text text-secondary px-2 py-1 uppercase tracking-wide">
            Search results
          </p>
          {TABLE_ROWS.map((row) => (
            <DialButton
              key={`${row.fileUrl}::${row.highlightId}`}
              size={ElementSize.Small}
              label={row.label}
              className={mergeClasses(
                'w-full !justify-start text-left px-2 py-1.5 rounded',
                activeRow.highlightId === row.highlightId &&
                  activeRow.fileUrl === row.fileUrl
                  ? 'bg-accent-primary-alpha text-accent-primary'
                  : 'hover:bg-layer-4',
              )}
              onClick={() => setActiveRow(row)}
            />
          ))}
        </div>

        {/* Right panel — PDF preview */}
        <div className="flex-1 min-w-0">
          <DocumentPreview
            fileUrl={activeRow.fileUrl}
            loadFileCb={loadFileCb}
            highlights={activeRow.highlights}
            selectedHighlightId={activeRow.highlightId}
            showOccurrences={false}
            title={
              activeRow.fileUrl === DOC_1_URL ? 'Document 1' : 'Document 2'
            }
          />
        </div>
      </div>
    </DocumentCacheProvider>
  );
};

/**
 * Simulates an external results table driving the PDF preview.
 *
 * Clicking a row switches the document (or stays on the same one) and
 * navigates to a specific highlighted page.
 */
export const DocumentSwitcher: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Simulates an external results table driving the PDF preview. ' +
          'Clicking a row switches the active document and navigates to a specific highlighted page. ',
      },
    },
  },
  render: () => <DocumentSwitcherDemoComponent />,
  decorators: [],
  args: {} as never,
};
