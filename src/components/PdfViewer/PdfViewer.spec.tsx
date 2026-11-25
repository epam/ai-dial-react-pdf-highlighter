import { act, render, screen, waitFor } from '@testing-library/react';
import {
  type MockInstance,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import {
  PDFHighlightViewer,
  RotationDirection,
  ZoomMode,
} from '@epam/pdf-highlighter-kit';

import type { PdfViewerApi } from '@/models/pdf-viewer.models';
import { PDFViewer } from './PdfViewer';

vi.mock('@epam/pdf-highlighter-kit', () => ({
  // A regular function, not an arrow: vitest 4 mocks are invoked with `new`.
  PDFHighlightViewer: vi.fn().mockImplementation(function () {
    const handlers: Record<string, ((...args: unknown[]) => void)[]> = {};
    let currentPage = 1;
    const emit = (event: string, ...args: unknown[]) => {
      (handlers[event] ?? []).forEach((handler) => handler(...args));
    };
    const viewer = {
      init: vi.fn(async (container: HTMLElement) => {
        container.tabIndex = 0;
      }),
      loadPDF: vi.fn().mockResolvedValue(undefined),
      preloadPages: vi.fn().mockResolvedValue(undefined),
      destroy: vi.fn(),
      loadHighlights: vi.fn(),
      setZoom: vi.fn(() => {
        if (viewer.__autoZoom) emit('zoomChanged');
        if (viewer.__autoRender) {
          queueMicrotask(() =>
            emit('renderComplete', { pageNumber: currentPage }),
          );
        }
      }),
      setPage: vi.fn((page: number) => {
        if (page >= 1 && page <= 5) currentPage = page;
      }),
      goToHighlight: vi.fn(),
      getZoom: vi.fn(() => 1),
      getCurrentPage: vi.fn(() => currentPage),
      zoomIn: vi.fn(),
      zoomOut: vi.fn(),
      getThumbnailsDataUrl: vi.fn().mockResolvedValue(new Map()),
      setPageDisplayRotation: vi.fn(),
      getPageDisplayRotation: vi.fn(() => 0),
      getTotalPages: vi.fn(() => 5),
      addEventListener: vi.fn(
        (event: string, handler: (...args: unknown[]) => void) => {
          handlers[event] = handlers[event] ?? [];
          handlers[event].push(handler);
        },
      ),
      removeEventListener: vi.fn(
        (event: string, handler: (...args: unknown[]) => void) => {
          handlers[event] = (handlers[event] ?? []).filter(
            (h) => h !== handler,
          );
        },
      ),
      __autoZoom: true,
      __autoRender: true,
      __emit: emit,
    };
    return viewer;
  }),
  ZoomMode: { AUTO: 'auto', PAGE_FIT: 'page-fit' },
  RotationDirection: {
    Clockwise: 'cw',
    CounterClockwise: 'ccw',
  },
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

  it('shows skeleton blocks while the PDF loads and hides them when ready', async () => {
    let resolvePDF!: () => void;
    const pendingPDF = new Promise<void>((resolve) => {
      resolvePDF = resolve;
    });
    render(<PDFViewer pdf={mockPdf} highlights={[]} />);
    const instance = MockViewerClass.mock.results[0].value;
    instance.loadPDF.mockReturnValueOnce(pendingPDF);

    await waitFor(() => expect(instance.loadPDF).toHaveBeenCalled());
    expect(
      screen.getByRole('status', { name: 'pdf preview loading' }),
    ).toBeInTheDocument();

    await act(async () => resolvePDF());
    expect(
      screen.queryByRole('status', { name: 'pdf preview loading' }),
    ).not.toBeInTheDocument();
  });

  it('keeps containerClassName on the root and fills it with the viewer surface', async () => {
    const onViewerReady = vi.fn();
    const { container } = render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        containerClassName="h-full max-h-[500px] bg-layer-base"
        onViewerReady={onViewerReady}
      />,
    );
    const root = container.firstChild;
    expect(root).toHaveClass('h-full', 'max-h-[500px]', 'bg-layer-base');
    const surface = MockViewerClass.mock.results[0].value.init.mock.calls[0][0];
    expect(surface.parentNode).toBe(root);
    expect(surface).toHaveClass('h-full');
    expect(surface).not.toHaveClass('max-h-[500px]');
    await waitFor(() => expect(onViewerReady).toHaveBeenCalled());
  });

  it.each(['auto', 'page-fit', '1.5'])(
    'keeps the viewer inert and covered until page 3 renders after %s zoom',
    async (zoom) => {
      const onViewerReady = vi.fn();
      render(
        <PDFViewer
          pdf={mockPdf}
          highlights={[]}
          zoom={zoom}
          selectedPageNumber={3}
          onViewerReady={onViewerReady}
        />,
      );
      const instance = MockViewerClass.mock.results[0].value;
      instance.__autoZoom = false;
      instance.__autoRender = false;
      const surface = instance.init.mock.calls[0][0];
      expect(surface).toHaveAttribute('inert');
      expect(surface).not.toHaveAttribute('hidden');

      await waitFor(() => expect(instance.setZoom).toHaveBeenCalled());
      expect(instance.getCurrentPage()).toBe(3);
      await act(async () => {
        instance.__emit('renderComplete', { pageNumber: 3 });
      });
      expect(onViewerReady).not.toHaveBeenCalled();
      await act(async () => {
        instance.__emit('zoomChanged');
        instance.__emit('renderComplete', { pageNumber: 1 });
      });
      expect(
        screen.getByRole('status', { name: 'pdf preview loading' }),
      ).toBeInTheDocument();
      expect(surface).toHaveAttribute('inert');
      expect(onViewerReady).not.toHaveBeenCalled();

      await act(async () => {
        instance.__emit('renderComplete', { pageNumber: 3 });
      });
      expect(onViewerReady).toHaveBeenCalledTimes(1);
      expect(instance.setZoom).toHaveBeenCalledTimes(1);
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument();
      expect(surface).not.toHaveAttribute('inert');
    },
  );

  it('waits for the selected page without requiring a zoom event', async () => {
    let resolvePage!: () => void;
    const pendingPage = new Promise<void>((resolve) => {
      resolvePage = resolve;
    });
    const onViewerReady = vi.fn();
    render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        selectedPageNumber={3}
        onViewerReady={onViewerReady}
      />,
    );
    const instance = MockViewerClass.mock.results[0].value;
    instance.preloadPages.mockReturnValueOnce(pendingPage);
    await waitFor(() =>
      expect(instance.preloadPages).toHaveBeenCalledWith([3]),
    );
    expect(onViewerReady).not.toHaveBeenCalled();
    expect(instance.setZoom).not.toHaveBeenCalled();
    await act(async () => resolvePage());
    expect(onViewerReady).toHaveBeenCalledTimes(1);
  });

  it('follows a changed initial destination before revealing the document', async () => {
    const onViewerReady = vi.fn();
    const highlights: Parameters<typeof PDFViewer>[0]['highlights'] = [];
    const { rerender } = render(
      <PDFViewer
        pdf={mockPdf}
        highlights={highlights}
        zoom="auto"
        selectedPageNumber={3}
        onViewerReady={onViewerReady}
      />,
    );
    const instance = MockViewerClass.mock.results[0].value;
    instance.__autoRender = false;
    await waitFor(() => expect(instance.setZoom).toHaveBeenCalledTimes(1));
    rerender(
      <PDFViewer
        pdf={mockPdf}
        highlights={highlights}
        zoom="1.5"
        selectedPageNumber={4}
        onViewerReady={onViewerReady}
      />,
    );
    await act(async () => {
      instance.__emit('renderComplete', { pageNumber: 3 });
    });
    expect(instance.setPage).toHaveBeenLastCalledWith(4);
    expect(onViewerReady).not.toHaveBeenCalled();
    await act(async () => {
      instance.__emit('renderComplete', { pageNumber: 4 });
    });
    expect(onViewerReady).toHaveBeenCalledTimes(1);
  });

  it('removes pending render listeners when unmounted', async () => {
    const onViewerReady = vi.fn();
    const { unmount } = render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        zoom="auto"
        onViewerReady={onViewerReady}
      />,
    );
    const instance = MockViewerClass.mock.results[0].value;
    instance.__autoRender = false;
    await waitFor(() => expect(instance.setZoom).toHaveBeenCalled());
    unmount();
    expect(instance.removeEventListener).toHaveBeenCalledWith(
      'renderComplete',
      expect.any(Function),
    );
    expect(instance.removeEventListener).toHaveBeenCalledWith(
      'renderError',
      expect.any(Function),
    );
    await act(async () => {
      instance.__emit('renderComplete', { pageNumber: 1 });
    });
    expect(onViewerReady).not.toHaveBeenCalled();
  });

  it('stops loading when the initial zoom raster fails', async () => {
    const error = new Error('Raster failed');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const onViewerReady = vi.fn();
    try {
      render(
        <PDFViewer
          pdf={mockPdf}
          highlights={[]}
          zoom="auto"
          onViewerReady={onViewerReady}
        />,
      );
      const instance = MockViewerClass.mock.results[0].value;
      instance.__autoRender = false;
      await waitFor(() => expect(instance.setZoom).toHaveBeenCalled());
      await act(async () => {
        instance.__emit('renderError', { pageNumber: 1, error });
      });
      expect(consoleError).toHaveBeenCalledWith('Error in initViewer:', error);
      expect(onViewerReady).not.toHaveBeenCalled();
      expect(
        screen.queryByRole('status', { name: 'pdf preview loading' }),
      ).not.toBeInTheDocument();
      expect(instance.init.mock.calls[0][0]).not.toHaveAttribute('inert');
    } finally {
      consoleError.mockRestore();
    }
  });

  it('hides the loading view when PDF loading fails', async () => {
    const error = new Error('Invalid PDF');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    try {
      render(<PDFViewer pdf={mockPdf} highlights={[]} />);
      const instance = MockViewerClass.mock.results[0].value;
      instance.loadPDF.mockRejectedValueOnce(error);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          'Error in initViewer:',
          error,
        );
        expect(
          screen.queryByRole('status', { name: 'pdf preview loading' }),
        ).not.toBeInTheDocument();
      });
    } finally {
      consoleError.mockRestore();
    }
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
    expect(
      screen.getByRole('status', { name: 'pdf preview loading' }),
    ).toBeInTheDocument();

    await waitFor(() => expect(onViewerReady).toHaveBeenCalledTimes(2));
    expect(
      screen.queryByRole('status', { name: 'pdf preview loading' }),
    ).not.toBeInTheDocument();
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
        zoom="auto"
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

    api.setPageDisplayRotation(2, 90, RotationDirection.Clockwise);
    expect(instance.setPageDisplayRotation).toHaveBeenCalledWith(
      2,
      90,
      RotationDirection.Clockwise,
    );

    api.getPageDisplayRotation(2);
    expect(instance.getPageDisplayRotation).toHaveBeenCalledWith(2);

    api.getCurrentPage();
    expect(instance.getCurrentPage).toHaveBeenCalled();
  });

  it('calls onCurrentPageChange when the viewer emits a scroll-driven pageChanged event', async () => {
    const onCurrentPageChange = vi.fn();
    render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        onCurrentPageChange={onCurrentPageChange}
      />,
    );

    const instance = await waitFor(() => {
      expect(MockViewerClass.mock.results[0]?.value.init).toHaveBeenCalled();
      return MockViewerClass.mock.results[0].value;
    });

    instance.__emit('pageChanged', {
      currentPage: 2,
      previousPage: 1,
      totalPages: 5,
    });

    expect(onCurrentPageChange).toHaveBeenCalledWith(2);
  });

  it('does not call onCurrentPageChange after the viewer is destroyed', async () => {
    const onCurrentPageChange = vi.fn();
    const { unmount } = render(
      <PDFViewer
        pdf={mockPdf}
        highlights={[]}
        onCurrentPageChange={onCurrentPageChange}
      />,
    );

    const instance = await waitFor(() => {
      expect(MockViewerClass.mock.results[0]?.value.init).toHaveBeenCalled();
      return MockViewerClass.mock.results[0].value;
    });

    unmount();
    instance.__emit('pageChanged', {
      currentPage: 3,
      previousPage: 2,
      totalPages: 5,
    });

    expect(onCurrentPageChange).not.toHaveBeenCalled();
  });
});
