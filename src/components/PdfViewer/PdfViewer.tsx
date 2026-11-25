import { mergeClasses } from '@epam/ai-dial-ui-kit';
import type {
  PageChangeEvent,
  PDFSource,
  RenderCompleteEvent,
  ViewerOptions,
  ZoomValue,
} from '@epam/pdf-highlighter-kit';
import {
  type InputHighlightData,
  PDFHighlightViewer,
  ZoomMode,
} from '@epam/pdf-highlighter-kit';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { PdfPreviewLoader } from '@/components/PdfPreviewLoader/PdfPreviewLoader';
import { AUTO_ZOOM_ID, FIT_ZOOM_ID } from '@/constants/pdf-viewer.constants';
import type { PdfViewerApi } from '@/models/pdf-viewer.models';

/**
 * Props for the low-level PDF rendering component.
 */
export interface PdfViewerProps {
  /** PDF source: a URL string, `Blob`, or `ArrayBuffer`. */
  pdf: PDFSource;
  /** Highlight data rendered by pdf-highlighter-kit. */
  highlights: InputHighlightData[];
  /** Zoom mode: `auto`, `page-fit`, or stringified numeric value such as `1.25`. */
  zoom?: string;
  /** Highlight id to navigate to after highlights are loaded. */
  selectedHighlightId?: string;
  /** Auto-focus the first highlight when highlights are loaded. */
  autoFocusFirstHighlight?: boolean;
  /** Navigates to this page after viewer initialization. */
  selectedPageNumber?: number;
  /** Additional class name for the root viewer container. */
  containerClassName?: string;
  /** Callback invoked when total pages become available. */
  onTotalPagesChange?: (totalPages: number) => void;
  /** Callback invoked with an imperative API when viewer setup completes. */
  onViewerReady?: (api: PdfViewerApi) => void;
  /**
   * Callback invoked with the 1-based page number whenever the viewport's
   * most-visible page changes, including page changes driven by the reader
   * scrolling the document rather than an explicit `navigateToPage` call.
   */
  onCurrentPageChange?: (page: number) => void;
  /** Optional list of pages to load instead of the full document. */
  selectedPages?: number[];
  /**
   * Override or extend low-level viewer initialization options.
   * Values are merged on top of the defaults (`enableTextSelection: true`,
   * `enableVirtualScrolling: true`, `bboxOrigin: 'top-left'`).
   */
  viewerOptions?: ViewerOptions;
}

const getZoomValue = (zoom?: string): ZoomValue | undefined => {
  if (zoom === AUTO_ZOOM_ID) return ZoomMode.AUTO;
  if (zoom === FIT_ZOOM_ID) return ZoomMode.PAGE_FIT;
  if (!zoom) return undefined;
  const value = parseFloat(zoom);
  return !Number.isNaN(value) && value > 0 ? value : undefined;
};

/* zoomChanged signals the scale, not the completion of the asynchronous raster. */
const applyInitialZoom = (
  viewer: PDFHighlightViewer,
  zoom: ZoomValue,
  pageNumber: number,
  signal: AbortSignal,
): Promise<void> =>
  new Promise((resolve, reject) => {
    let zoomApplied = false;
    const cleanup = () => {
      viewer.removeEventListener('zoomChanged', handleZoom);
      viewer.removeEventListener('renderComplete', handleRender);
      viewer.removeEventListener('renderError', handleError);
      signal.removeEventListener('abort', handleAbort);
    };
    const handleZoom = () => {
      zoomApplied = true;
    };
    const handleRender = (event?: unknown) => {
      if (
        zoomApplied &&
        (event as RenderCompleteEvent)?.pageNumber === pageNumber
      ) {
        cleanup();
        resolve();
      }
    };
    const handleError = (event?: unknown) => {
      const error = event as { pageNumber?: number; error?: unknown };
      if (error?.pageNumber === pageNumber) {
        cleanup();
        reject(error.error);
      }
    };
    const handleAbort = () => {
      cleanup();
      resolve();
    };

    if (signal.aborted) {
      resolve();
      return;
    }
    viewer.addEventListener('zoomChanged', handleZoom);
    viewer.addEventListener('renderComplete', handleRender);
    viewer.addEventListener('renderError', handleError);
    signal.addEventListener('abort', handleAbort, { once: true });
    try {
      viewer.setZoom(zoom);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });

type InitialViewerOptions = Pick<
  PdfViewerProps,
  | 'highlights'
  | 'zoom'
  | 'selectedHighlightId'
  | 'autoFocusFirstHighlight'
  | 'selectedPageNumber'
>;

/**
 * Low-level PDF viewer wrapper around `PDFHighlightViewer`.
 *
 * This component handles rendering/navigation without the higher-level toolbar from
 * `DocumentPreview`, and shows a skeleton loading view until initialization completes.
 */
export const PDFViewer: FC<PdfViewerProps> = ({
  pdf,
  highlights,
  selectedHighlightId,
  autoFocusFirstHighlight = false,
  selectedPageNumber,
  zoom,
  containerClassName,
  onTotalPagesChange,
  onViewerReady,
  onCurrentPageChange,
  selectedPages,
  viewerOptions,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PDFHighlightViewer | null>(null);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // Becomes true after the first zoomChanged event fires, meaning the initial
  // AUTO / PAGE_FIT zoom has fully resolved before any highlight navigation.
  const [isZoomApplied, setIsZoomApplied] = useState(false);
  const onTotalPagesChangeRef = useRef(onTotalPagesChange);
  const onViewerReadyRef = useRef(onViewerReady);
  const onCurrentPageChangeRef = useRef(onCurrentPageChange);
  const viewerOptionsRef = useRef(viewerOptions);
  const initialOptionsRef = useRef<InitialViewerOptions>({
    highlights,
    zoom,
    selectedHighlightId,
    autoFocusFirstHighlight,
    selectedPageNumber,
  });
  const appliedOptionsRef = useRef<InitialViewerOptions | null>(null);

  useEffect(() => {
    initialOptionsRef.current = {
      highlights,
      zoom,
      selectedHighlightId,
      autoFocusFirstHighlight,
      selectedPageNumber,
    };
  }, [
    highlights,
    zoom,
    selectedHighlightId,
    autoFocusFirstHighlight,
    selectedPageNumber,
  ]);

  useEffect(() => {
    onTotalPagesChangeRef.current = onTotalPagesChange;
  }, [onTotalPagesChange]);

  useEffect(() => {
    onViewerReadyRef.current = onViewerReady;
  }, [onViewerReady]);

  useEffect(() => {
    onCurrentPageChangeRef.current = onCurrentPageChange;
  }, [onCurrentPageChange]);

  useEffect(() => {
    viewerOptionsRef.current = viewerOptions;
  }, [viewerOptions]);

  const goTo = useCallback(
    (id: string) => viewerRef.current?.goToHighlight(id),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    setIsViewerReady(false);
    setIsLoading(true);
    setIsZoomApplied(false);
    appliedOptionsRef.current = null;
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    let viewer: PDFHighlightViewer | null = null;
    let mounted = true;
    const abortController = new AbortController();

    const handleZoomChanged = () => {
      if (mounted) setIsZoomApplied(true);
    };

    const handlePageChanged = (event: PageChangeEvent) => {
      if (mounted) onCurrentPageChangeRef.current?.(event.currentPage);
    };

    const initViewer = async () => {
      try {
        viewer = new PDFHighlightViewer();

        await viewer.init(containerRef.current as HTMLElement, {
          enableTextSelection: true,
          enableVirtualScrolling: true,
          bboxOrigin: 'top-left',
          ...viewerOptionsRef.current,
        });
        if (!mounted) {
          viewer.destroy();
          return;
        }

        viewer.addEventListener('zoomChanged', handleZoomChanged);
        viewer.addEventListener(
          'pageChanged',
          handlePageChanged as (...args: unknown[]) => void,
        );

        await viewer.loadPDF(pdf, { selectedPages });
        if (!mounted) {
          viewer.destroy();
          return;
        }

        const totalPages = (
          viewer as unknown as { getTotalPages?: () => number }
        ).getTotalPages?.();
        if (typeof totalPages === 'number' && totalPages > 0) {
          onTotalPagesChangeRef.current?.(totalPages);
        }

        /* Apply navigation before fitting so mixed-size PDFs fit the target page.
         * Repeat if the requested initial view changes while rendering is pending. */
        while (mounted) {
          const options = initialOptionsRef.current;
          const zoomValue = getZoomValue(options.zoom);
          const highlightId =
            zoomValue !== undefined && options.selectedHighlightId
              ? options.selectedHighlightId
              : options.autoFocusFirstHighlight
                ? options.highlights[0]?.id
                : undefined;
          const highlight = options.highlights.find(
            (h) => h.id === highlightId,
          );
          const targetPage =
            options.selectedPageNumber ?? highlight?.bboxes?.[0]?.page;

          viewer.loadHighlights(options.highlights);
          if (targetPage) viewer.setPage(targetPage);
          const pageNumber = viewer.getCurrentPage();
          if (zoomValue !== undefined) {
            await applyInitialZoom(
              viewer,
              zoomValue,
              pageNumber,
              abortController.signal,
            );
          } else {
            await viewer.preloadPages([pageNumber]);
          }
          if (!mounted) return;

          if (highlightId && !options.selectedPageNumber) {
            viewer.goToHighlight(highlightId);
            await viewer.preloadPages([viewer.getCurrentPage()]);
          }
          if (!mounted) return;
          if (options !== initialOptionsRef.current) continue;
          appliedOptionsRef.current = {
            ...options,
            selectedHighlightId:
              zoomValue !== undefined ? options.selectedHighlightId : undefined,
          };
          break;
        }

        if (mounted) {
          viewerRef.current = viewer;
          setIsViewerReady(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        setIsLoading(false);
        console.error('Error in initViewer:', err);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      abortController.abort();
      if (viewer) {
        viewer.removeEventListener('zoomChanged', handleZoomChanged);
        viewer.removeEventListener(
          'pageChanged',
          handlePageChanged as (...args: unknown[]) => void,
        );
        viewer.destroy();
      }
    };
  }, [pdf, selectedPages]);

  useEffect(() => {
    const applied = appliedOptionsRef.current;
    if (
      !isViewerReady ||
      !viewerRef.current ||
      !applied ||
      (applied.highlights === highlights &&
        applied.autoFocusFirstHighlight === autoFocusFirstHighlight)
    ) {
      return;
    }

    viewerRef.current.loadHighlights(highlights);
    applied.highlights = highlights;
    applied.autoFocusFirstHighlight = autoFocusFirstHighlight;
    if (autoFocusFirstHighlight && highlights && highlights[0]) {
      goTo(highlights[0].id);
    }
  }, [autoFocusFirstHighlight, goTo, highlights, isViewerReady]);

  useEffect(() => {
    const applied = appliedOptionsRef.current;
    if (!isViewerReady || !applied) return;
    if (
      isZoomApplied &&
      selectedHighlightId &&
      applied.selectedHighlightId !== selectedHighlightId
    ) {
      goTo(selectedHighlightId);
      applied.selectedHighlightId = selectedHighlightId;
    } else if (!selectedHighlightId) {
      applied.selectedHighlightId = undefined;
    }
  }, [goTo, isViewerReady, isZoomApplied, selectedHighlightId]);

  useEffect(() => {
    const applied = appliedOptionsRef.current;
    if (!isViewerReady || !applied || applied.zoom === zoom) return;
    const value = getZoomValue(zoom);
    if (value !== undefined) viewerRef.current?.setZoom(value);
    applied.zoom = zoom;
  }, [isViewerReady, zoom]);

  useEffect(() => {
    const applied = appliedOptionsRef.current;
    if (!isViewerReady || !applied) return;
    if (
      selectedPageNumber &&
      applied.selectedPageNumber !== selectedPageNumber
    ) {
      viewerRef.current?.setPage(selectedPageNumber);
    }
    applied.selectedPageNumber = selectedPageNumber;
  }, [isViewerReady, selectedPageNumber]);

  useEffect(() => {
    if (!isViewerReady || !viewerRef.current) return;
    const viewer = viewerRef.current;
    onViewerReadyRef.current?.({
      getThumbnailsDataUrl: (pageNumbers, options) =>
        viewer.getThumbnailsDataUrl(pageNumbers, options),
      zoomIn: () => viewer.zoomIn(),
      zoomOut: () => viewer.zoomOut(),
      getZoom: () => viewer.getZoom(),
      getCurrentPage: () => viewer.getCurrentPage(),
      navigateToPage: (page) => viewer.setPage?.(page),
      setPageDisplayRotation: (pageNumber, degrees, direction) =>
        viewer.setPageDisplayRotation(pageNumber, degrees, direction),
      getPageDisplayRotation: (pageNumber) =>
        viewer.getPageDisplayRotation(pageNumber),
    });
  }, [isViewerReady]);

  /*
   * pdf-highlighter-kit adds `pdf-highlight-viewer` to this element and injects
   * an unlayered `.pdf-highlight-viewer { background: #f5f5f5 }`, which beats
   * any layered utility, so the override needs `!`. The viewer stays
   * transparent and the pages sit on whatever surface the host (or
   * `containerClassName`) provides.
   */
  return (
    <div
      className={mergeClasses(
        'relative grow min-w-0 min-h-0',
        containerClassName,
      )}
    >
      <div
        ref={containerRef}
        inert={isLoading}
        className="h-full min-w-0 overflow-auto bg-transparent!"
      />
      {isLoading && (
        <PdfPreviewLoader className="absolute inset-0 z-10 overflow-hidden" />
      )}
    </div>
  );
};
