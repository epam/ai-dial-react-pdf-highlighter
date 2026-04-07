import type { Meta, StoryObj } from '@storybook/react-vite';

import { sampleHighlights } from '@/constants/storybook';
import { PDFViewer } from './PdfViewer';

const SAMPLE_PDF_URL = '/pdf_sample.pdf';

/**
 * `PDFViewer` is the low-level PDF renderer. It wraps `PDFHighlightViewer` from
 * `@epam/pdf-highlighter-kit` and exposes an imperative API via `onViewerReady`.
 *
 * For a complete viewer with toolbar, zoom controls, and cache — use `DocumentPreview`.
 */
const meta = {
  title: 'Components/PDFViewer',
  component: PDFViewer,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Low-level PDF renderer wrapping `@epam/pdf-highlighter-kit`. Accepts a URL or Blob as `pdf`, an array of `InputHighlightData` annotations, and exposes an imperative API via `onViewerReady`.',
      },
    },
  },
  argTypes: {
    zoom: {
      control: 'select',
      options: [
        'auto',
        'page-fit',
        '0.5',
        '0.75',
        '1',
        '1.25',
        '1.5',
        '2',
        '3',
      ],
      description: "'auto', 'page-fit', or a stringified number",
    },
    autoFocusFirstHighlight: { control: 'boolean' },
  },
} satisfies Meta<typeof PDFViewer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithSamplePdfLink: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders the viewer by passing a URL string as the `pdf` prop — the most common usage when the document is served from a static path or remote endpoint.',
      },
    },
  },
  args: {
    pdf: SAMPLE_PDF_URL,
    highlights: [],
    zoom: 'auto',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px] flex">
        <Story />
      </div>
    ),
  ],
};
export const WithSamplePdfBlob: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Fetches the PDF from a URL, converts the response to a `Blob`, and passes it directly as the `pdf` prop — typical when the document comes from an API response or is loaded programmatically.',
      },
    },
  },
  loaders: [
    async () => {
      const response = await fetch(SAMPLE_PDF_URL);
      const blob = await response.blob();
      return { pdfBlob: blob };
    },
  ],
  render: (args, { loaded: { pdfBlob } }) => (
    <div className="h-[700px] flex">
      <PDFViewer {...args} pdf={pdfBlob as Blob} />
    </div>
  ),
  args: {
    pdf: SAMPLE_PDF_URL,
    highlights: [],
    zoom: 'auto',
  },
};

export const WithSamplePdfArrayBuffer: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Fetches the PDF from a URL, converts the response to an `ArrayBuffer`, and passes it as the `pdf` prop — useful when you already have raw binary data, e.g. from a `FileReader` or a worker response.',
      },
    },
  },
  loaders: [
    async () => {
      const response = await fetch(SAMPLE_PDF_URL);
      const buffer = await response.arrayBuffer();
      return { pdfBuffer: buffer };
    },
  ],
  render: (args, { loaded: { pdfBuffer } }) => (
    <div className="h-[700px] flex">
      <PDFViewer {...args} pdf={pdfBuffer as ArrayBuffer} />
    </div>
  ),
  args: {
    pdf: SAMPLE_PDF_URL,
    highlights: [],
    zoom: 'auto',
  },
};

export const PageFitZoom: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Uses the `'page-fit'` zoom value to scale the document so the full page height is visible within the viewer container.",
      },
    },
  },
  args: {
    pdf: SAMPLE_PDF_URL,
    highlights: [],
    zoom: 'page-fit',
  },
  decorators: [
    (Story) => (
      <div className="h-[700px] flex">
        <Story />
      </div>
    ),
  ],
};

export const WithHighlights: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Renders annotation highlights overlaid on the PDF. `autoFocusFirstHighlight` is enabled so the viewer scrolls to the first annotation on mount.',
      },
    },
  },
  args: {
    pdf: SAMPLE_PDF_URL,
    highlights: sampleHighlights,
    zoom: '1.25',
    autoFocusFirstHighlight: true,
  },
  decorators: [
    (Story) => (
      <div className="h-[700px] flex">
        <Story />
      </div>
    ),
  ],
};

export const WithHighlightLabels: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates highlights with visible `label` and `labelStyle` properties — useful for annotating regions such as tables or named sections.',
      },
    },
  },
  args: {
    pdf: SAMPLE_PDF_URL,
    zoom: '1.25',
    autoFocusFirstHighlight: true,
    highlights: [
      {
        id: 'table-1',
        bboxes: [{ x1: 35, y1: 140, x2: 580, y2: 180, page: 1 }],
        style: {
          backgroundColor: 'rgba(0, 120, 212, 0.15)',
          borderColor: '#0078d4',
          borderWidth: '1px',
          opacity: 1,
        },
        label: 'Table 1',
        labelStyle: {
          fontSize: '10px',
          color: '#ffffff',
          padding: '2px 4px',
          offsetLeft: -7,
          offsetTop: 1,
          borderRadius: '2px 0px 0px 2px',
          whiteSpace: 'nowrap',
          backgroundColor: '#0078d4',
        },
      },
      {
        id: 'table-2',
        bboxes: [{ x1: 35, y1: 252, x2: 580, y2: 330, page: 1 }],
        style: {
          backgroundColor: 'rgba(0, 120, 212, 0.15)',
          borderColor: '#0078d4',
          borderWidth: '1px',
          opacity: 1,
        },
        label: 'Table 2',
        labelStyle: {
          fontSize: '10px',
          color: '#ffffff',
          padding: '2px 4px',
          offsetTop: 1,
          borderRadius: '2px 0px 0px 2px',
          whiteSpace: 'nowrap',
          backgroundColor: '#0078d4',
        },
      },
      {
        id: 'table-3',
        bboxes: [{ x1: 35, y1: 340, x2: 580, y2: 400, page: 1 }],
        style: {
          backgroundColor: 'rgba(120, 120, 120, 0.15)',
          borderColor: '#787878',
          borderWidth: '1px',
          opacity: 1,
        },
        label: 'Table 3',
        labelStyle: {
          fontSize: '10px',
          color: '#ffffff',
          offsetTop: 1,
          padding: '2px 4px',
          borderRadius: '2px 0px 0px 2px',
          whiteSpace: 'nowrap',
          backgroundColor: '#787878',
        },
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="h-[700px] flex">
        <Story />
      </div>
    ),
  ],
};
