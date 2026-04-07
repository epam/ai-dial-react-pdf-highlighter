import { render, waitFor } from '@testing-library/react';
import {
  type MockInstance,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { PDFHighlightViewer, ZoomMode } from '@epam/pdf-highlighter-kit';

import { PDFViewer, type PdfViewerApi } from './PdfViewer';

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
    getTotalPages: vi.fn(() => 5),
  })),
  ZoomMode: { AUTO: 'auto', PAGE_FIT: 'page-fit' },
}));

const MockViewerClass = PDFHighlightViewer as unknown as MockInstance;

const mockPdf = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

describe('PDFViewer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a container element', () => {
    const { container } = render(<PDFViewer pdf={mockPdf} highlights={[]} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('initializes PDFHighlightViewer and loads the PDF', async () => {
    render(<PDFViewer pdf={mockPdf} highlights={[]} />);

    await waitFor(() => {
      expect(MockViewerClass).toHaveBeenCalledTimes(1);
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.init).toHaveBeenCalled();
      expect(instance.loadPDF).toHaveBeenCalledWith(
        mockPdf,
        expect.objectContaining({}),
      );
    });
  });

  it('calls onViewerReady with the API after the viewer is ready', async () => {
    const onViewerReady = vi.fn();
    render(
      <PDFViewer pdf={mockPdf} highlights={[]} onViewerReady={onViewerReady} />,
    );

    await waitFor(() => {
      expect(onViewerReady).toHaveBeenCalledWith(
        expect.objectContaining({
          getThumbnailsDataUrl: expect.any(Function),
          zoomIn: expect.any(Function),
          zoomOut: expect.any(Function),
          getZoom: expect.any(Function),
        }),
      );
    });
  });

  it('calls onTotalPagesChange with the total page count', async () => {
    const onTotalPagesChange = vi.fn();
    render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        onTotalPagesChange={onTotalPagesChange}
      />,
    );

    await waitFor(() => {
      expect(onTotalPagesChange).toHaveBeenCalledWith(5);
    });
  });

  it('loads highlights once the viewer is ready', async () => {
    const highlights = [
      { id: 'h1', pageNumber: 1, rects: [] },
    ] as unknown as Parameters<typeof PDFViewer>[0]['highlights'];
    render(<PDFViewer pdf={mockPdf} highlights={highlights} />);

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.loadHighlights).toHaveBeenCalledWith(highlights);
    });
  });

  it('sets AUTO zoom when zoom prop is "auto"', async () => {
    render(<PDFViewer pdf={mockPdf} highlights={[]} zoom="auto" />);

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.setZoom).toHaveBeenCalledWith(ZoomMode.AUTO);
    });
  });

  it('sets PAGE_FIT zoom when zoom prop is "page-fit"', async () => {
    render(<PDFViewer pdf={mockPdf} highlights={[]} zoom="page-fit" />);

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.setZoom).toHaveBeenCalledWith(ZoomMode.PAGE_FIT);
    });
  });

  it('sets numeric zoom value when zoom prop is a numeric string', async () => {
    render(<PDFViewer pdf={mockPdf} highlights={[]} zoom="1.5" />);

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.setZoom).toHaveBeenCalledWith(1.5);
    });
  });

  it('navigates to selectedPageNumber after viewer is ready', async () => {
    render(<PDFViewer pdf={mockPdf} highlights={[]} selectedPageNumber={3} />);

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.setPage).toHaveBeenCalledWith(3);
    });
  });

  it('destroys the viewer instance on unmount', async () => {
    const { unmount } = render(<PDFViewer pdf={mockPdf} highlights={[]} />);

    await waitFor(() => {
      expect(MockViewerClass.mock.results[0]?.value.init).toHaveBeenCalled();
    });

    unmount();
    expect(MockViewerClass.mock.results[0].value.destroy).toHaveBeenCalled();
  });

  it('destroys the old viewer when the pdf prop changes', async () => {
    const newPdf = new Blob(['%PDF-1.5'], { type: 'application/pdf' });
    const onViewerReady = vi.fn();
    const { rerender } = render(
      <PDFViewer pdf={mockPdf} highlights={[]} onViewerReady={onViewerReady} />,
    );

    await waitFor(() => expect(onViewerReady).toHaveBeenCalledTimes(1));
    const firstInstance = MockViewerClass.mock.results[0].value;

    rerender(
      <PDFViewer pdf={newPdf} highlights={[]} onViewerReady={onViewerReady} />,
    );

    await waitFor(() => expect(onViewerReady).toHaveBeenCalledTimes(2));
    expect(firstInstance.destroy).toHaveBeenCalled();
  });

  it('auto-focuses the first highlight when autoFocusFirstHighlight is true', async () => {
    const highlights = [
      { id: 'focus-h1', pageNumber: 1, rects: [] },
    ] as unknown as Parameters<typeof PDFViewer>[0]['highlights'];

    render(
      <PDFViewer
        pdf={mockPdf}
        highlights={highlights}
        autoFocusFirstHighlight={true}
      />,
    );

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.goToHighlight).toHaveBeenCalledWith('focus-h1');
    });
  });

  it('navigates to selectedHighlightId after the viewer is ready', async () => {
    render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        selectedHighlightId="highlight-42"
      />,
    );

    await waitFor(() => {
      const instance = MockViewerClass.mock.results[0].value;
      expect(instance.goToHighlight).toHaveBeenCalledWith('highlight-42');
    });
  });

  it('API proxy methods forward calls to the underlying viewer', async () => {
    const onViewerReady = vi.fn();
    render(
      <PDFViewer pdf={mockPdf} highlights={[]} onViewerReady={onViewerReady} />,
    );

    await waitFor(() => expect(onViewerReady).toHaveBeenCalled());
    const api = onViewerReady.mock.calls[0][0] as PdfViewerApi;
    const instance = MockViewerClass.mock.results[0].value;

    api.zoomIn();
    expect(instance.zoomIn).toHaveBeenCalled();

    api.zoomOut();
    expect(instance.zoomOut).toHaveBeenCalled();

    api.getZoom();
    expect(instance.getZoom).toHaveBeenCalled();

    await api.getThumbnailsDataUrl([1, 2], { maxWidth: 104 });
    expect(instance.getThumbnailsDataUrl).toHaveBeenCalledWith([1, 2], {
      maxWidth: 104,
    });
  });
});
