import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentCacheProvider } from '@/context/documentCacheProvider';
import { PDFViewer } from '@/components/PdfViewer/PdfViewer';
import { DocumentPreview } from './DocumentPreview';

// Hoisted so the reference is available inside the vi.mock factory.
const mockViewerApi = vi.hoisted(() => ({
  getThumbnailsDataUrl: vi
    .fn()
    .mockResolvedValue(new Map([[1, 'data:image/jpeg,thumb1']])),
  zoomIn: vi.fn(),
  zoomOut: vi.fn(),
  getZoom: vi.fn().mockReturnValue(1),
}));

vi.mock('@/components/PdfViewer/PdfViewer', () => ({
  // Simulates a ready viewer; defer onViewerReady so the parent is not updated
  // during the mock's render (matches real async viewer init).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  PDFViewer: vi.fn((props: any) => {
    const { onViewerReady } = props;
    useEffect(() => {
      onViewerReady?.(mockViewerApi);
    }, [onViewerReady]);
    return null;
  }),
}));

const mockBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

const defaultProps = {
  fileUrl: 'https://example.com/test.pdf',
  loadFileCb: vi.fn().mockResolvedValue(mockBlob),
  highlights: [] as Parameters<typeof DocumentPreview>[0]['highlights'],
};

function renderDocumentPreview(
  props: Partial<Parameters<typeof DocumentPreview>[0]> = {},
) {
  return render(
    <DocumentCacheProvider>
      <DocumentPreview {...defaultProps} {...props} />
    </DocumentCacheProvider>,
  );
}

function renderDocumentPreviewWithoutCache(
  props: Partial<Parameters<typeof DocumentPreview>[0]> = {},
) {
  return render(<DocumentPreview {...defaultProps} {...props} />);
}

describe('DocumentPreview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Restore implementations cleared by clearAllMocks.
    mockViewerApi.getZoom.mockReturnValue(1);
    mockViewerApi.getThumbnailsDataUrl.mockResolvedValue(
      new Map([[1, 'data:image/jpeg,thumb1']]),
    );
  });

  it('shows the loading overlay while the file is being fetched', async () => {
    renderDocumentPreview({
      loadFileCb: () =>
        new Promise(() => {
          /* empty */
        }),
    });

    expect(
      await screen.findByRole('status', { name: 'pdf preview loading' }),
    ).toBeInTheDocument();
  });

  it('hides the loading overlay after the file loads', async () => {
    renderDocumentPreview();

    await waitFor(() =>
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument(),
    );
  });

  it('shows the error message when loadFileCb rejects', async () => {
    renderDocumentPreview({
      loadFileCb: vi.fn().mockRejectedValue(new Error('network error')),
    });

    expect(
      await screen.findByText('Failed to load document.'),
    ).toBeInTheDocument();
  });

  it('shows the custom errorLabel when provided and load fails', async () => {
    renderDocumentPreview({
      loadFileCb: vi.fn().mockRejectedValue(new Error('error')),
      errorLabel: 'Custom error message',
    });

    expect(await screen.findByText('Custom error message')).toBeInTheDocument();
  });

  it('shows the unsupported label for non-PDF files', async () => {
    renderDocumentPreview({
      fileUrl: 'https://example.com/report.docx',
      unsupportedLabel: 'Unsupported file type',
    });

    expect(
      await screen.findByText('Unsupported file type'),
    ).toBeInTheDocument();
  });

  it('detects PDF when fileUrl contains a query string and no fileName is given', async () => {
    renderDocumentPreview({
      fileUrl: 'https://example.com/doc.pdf?token=abc',
      unsupportedLabel: 'Unsupported file type',
    });

    await waitFor(() =>
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument(),
    );

    expect(screen.queryByText('Unsupported file type')).not.toBeInTheDocument();
  });

  it('shows the occurrences counter with active highlights', () => {
    renderDocumentPreview({
      highlights: [
        { id: '1', pageNumber: 1, rects: [] },
        { id: '2', pageNumber: 2, rects: [] },
      ] as unknown as Parameters<typeof DocumentPreview>[0]['highlights'],
    });

    expect(screen.getByText(/Occurrences/)).toBeInTheDocument();
    expect(screen.getByText('1/2')).toBeInTheDocument();
  });

  it('shows 0 when there are no highlights', () => {
    renderDocumentPreview({ highlights: [] });

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('hides the occurrences counter when showOccurrences is false', () => {
    renderDocumentPreview({ showOccurrences: false });

    expect(screen.queryByText(/Occurrences/)).not.toBeInTheDocument();
  });

  it('does not pass occurrence selectedHighlightId when showOccurrences is false', async () => {
    const highlights = [
      { id: 'h1', pageNumber: 1, rects: [] },
      { id: 'h2', pageNumber: 2, rects: [] },
    ] as unknown as Parameters<typeof DocumentPreview>[0]['highlights'];

    renderDocumentPreview({ highlights, showOccurrences: false });

    const mockPDFViewer = vi.mocked(PDFViewer);
    await waitFor(() => expect(mockPDFViewer).toHaveBeenCalled());

    const lastProps = () =>
      mockPDFViewer.mock.calls[mockPDFViewer.mock.calls.length - 1][0];

    expect(lastProps().selectedHighlightId).toBeUndefined();
  });

  it('shows the custom title in the toolbar', () => {
    renderDocumentPreview({ title: 'Annual Report 2025' });

    expect(screen.getByText('Annual Report 2025')).toBeInTheDocument();
  });

  it('shows the fileName when provided', () => {
    renderDocumentPreview({
      fileName: 'document.pdf',
      fileUrl: 'https://example.com/document.pdf',
    });

    expect(screen.getByText('document.pdf')).toBeInTheDocument();
  });

  it('shows the loading overlay when showLoaderOverlay is true', async () => {
    renderDocumentPreview({ showLoaderOverlay: true });

    await waitFor(() =>
      expect(
        screen.getByRole('status', { name: 'pdf preview loading' }),
      ).toBeInTheDocument(),
    );
  });

  it('cycles the occurrences counter forward on next-click', async () => {
    const user = userEvent.setup();
    renderDocumentPreview({
      highlights: [
        { id: '1', pageNumber: 1, rects: [] },
        { id: '2', pageNumber: 2, rects: [] },
        { id: '3', pageNumber: 3, rects: [] },
      ] as unknown as Parameters<typeof DocumentPreview>[0]['highlights'],
    });

    expect(screen.getByText('1/3')).toBeInTheDocument();

    // first two rendered buttons are occurrence navigation (down / up)
    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]);

    expect(screen.getByText('2/3')).toBeInTheDocument();
  });

  it('passes the selected highlight id to PDFViewer when navigating occurrences', async () => {
    const user = userEvent.setup();
    const highlights = [
      { id: 'h1', pageNumber: 1, rects: [] },
      { id: 'h2', pageNumber: 2, rects: [] },
      { id: 'h3', pageNumber: 3, rects: [] },
    ] as unknown as Parameters<typeof DocumentPreview>[0]['highlights'];

    renderDocumentPreview({ highlights });

    const mockPDFViewer = vi.mocked(PDFViewer);

    // Wait for the file to load so PDFViewer mounts.
    await waitFor(() => expect(mockPDFViewer).toHaveBeenCalled());

    const lastProps = () =>
      mockPDFViewer.mock.calls[mockPDFViewer.mock.calls.length - 1][0];

    expect(lastProps().selectedHighlightId).toBe('h1');

    const buttons = screen.getAllByRole('button');
    await user.click(buttons[0]); // next occurrence
    expect(lastProps().selectedHighlightId).toBe('h2');

    await user.click(buttons[0]); // next occurrence
    expect(lastProps().selectedHighlightId).toBe('h3');
  });

  it('uses a custom occurrencesLabel when provided', () => {
    renderDocumentPreview({
      highlights: [
        { id: '1', pageNumber: 1, rects: [] },
      ] as unknown as Parameters<typeof DocumentPreview>[0]['highlights'],
      occurrencesLabel: 'Matches',
    });

    expect(screen.getByText(/Matches/)).toBeInTheDocument();
  });

  it('clicking zoom in calls getZoom on the viewer API', async () => {
    const user = userEvent.setup();
    renderDocumentPreview();

    // Wait for the file to load so PDFViewer mounts and onViewerReady fires.
    await waitFor(() =>
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(mockViewerApi.getZoom).toHaveBeenCalled();
  });

  it('clicking zoom out calls getZoom on the viewer API', async () => {
    const user = userEvent.setup();
    renderDocumentPreview();

    await waitFor(() =>
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument(),
    );

    await user.click(screen.getByRole('button', { name: 'Zoom out' }));

    expect(mockViewerApi.getZoom).toHaveBeenCalled();
  });

  it('calls onThumbnailsLoaded with a map of thumbnails when conditions are met', async () => {
    const onThumbnailsLoaded = vi.fn();
    renderDocumentPreview({
      thumbnailPageNumbers: [1],
      onThumbnailsLoaded,
    });

    await waitFor(() => {
      expect(onThumbnailsLoaded).toHaveBeenCalledWith(expect.any(Map));
    });

    const resultMap: Map<number, string> = onThumbnailsLoaded.mock.calls[0][0];
    expect(resultMap.get(1)).toBe('data:image/jpeg,thumb1');
  });

  it('works without DocumentPreviewCacheProvider by calling loadFileCb directly', async () => {
    const loadFileCb = vi.fn().mockResolvedValue(mockBlob);
    renderDocumentPreviewWithoutCache({ loadFileCb });

    await waitFor(() =>
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument(),
    );

    expect(loadFileCb).toHaveBeenCalledWith(defaultProps.fileUrl);
  });
});
