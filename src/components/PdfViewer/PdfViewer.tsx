import { mergeClasses } from '@epam/ai-dial-ui-kit';
import type { PDFSource, ThumbnailOptions } from '@epam/pdf-highlighter-kit';
import {
  type InputHighlightData,
  PDFHighlightViewer,
  ZoomMode,
} from '@epam/pdf-highlighter-kit';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

import { AUTO_ZOOM_ID, FIT_ZOOM_ID } from '@/constants/pdf-viewer.constants';

/**
 * Imperative API exposed by {@link PDFViewer} through the `onViewerReady` callback.
 */
export interface PdfViewerApi {
  /**
   * Generates data URLs for requested pages.
   *
   * @param pageNumbers 1-based page numbers to render thumbnails for.
   * @param options Rendering options forwarded to pdf-highlighter-kit.
   */
  getThumbnailsDataUrl: (
    pageNumbers: number[],
    options?: ThumbnailOptions,
  ) => Promise<Map<number, string>>;
  /** Increases current zoom level by one viewer step. */
  zoomIn: () => void;
  /** Decreases current zoom level by one viewer step. */
  zoomOut: () => void;
  /** Returns the current numeric zoom value. */
  getZoom: () => number;
  /** Navigates to a specific 1-based page number. */
  navigateToPage: (page: number) => void;
}

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
  /** Optional list of pages to load instead of the full document. */
  selectedPages?: number[];
}

/**
 * Low-level PDF viewer wrapper around `PDFHighlightViewer`.
 *
 * This component is intended for scenarios where only rendering/navigation logic is needed
 * without the higher-level toolbar and overlays from `DocumentPreview`.
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
  selectedPages,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PDFHighlightViewer | null>(null);
  const [isViewerReady, setIsViewerReady] = useState(false);
  const [isHighlightInit, setIsHighlightInit] = useState(false);
  const onTotalPagesChangeRef = useRef(onTotalPagesChange);
  const onViewerReadyRef = useRef(onViewerReady);

  useEffect(() => {
    onTotalPagesChangeRef.current = onTotalPagesChange;
  }, [onTotalPagesChange]);

  useEffect(() => {
    onViewerReadyRef.current = onViewerReady;
  }, [onViewerReady]);

  const goTo = useCallback(
    (id: string) => viewerRef.current?.goToHighlight(id),
    [],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    setIsViewerReady(false);
    setIsHighlightInit(false);
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    let viewer: PDFHighlightViewer | null = null;
    let mounted = true;

    const initViewer = async () => {
      try {
        viewer = new PDFHighlightViewer();

        await viewer.init(containerRef.current as HTMLElement, {
          enableTextSelection: true,
          enableVirtualScrolling: true,
          bboxOrigin: 'top-left',
        });
        if (!mounted) {
          viewer.destroy();
          return;
        }

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

        if (mounted) {
          viewerRef.current = viewer;
          setIsViewerReady(true);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }
        console.error('Error in initViewer:', err);
      }
    };

    initViewer();

    return () => {
      mounted = false;
      if (viewer) viewer.destroy();
    };
  }, [pdf, selectedPages]);

  useEffect(() => {
    if (!isViewerReady || !viewerRef.current) {
      return;
    }

    viewerRef.current.loadHighlights(highlights);
    if (autoFocusFirstHighlight && highlights && highlights[0]) {
      goTo(highlights[0].id);
    }
  }, [autoFocusFirstHighlight, goTo, highlights, isViewerReady]);

  useEffect(() => {
    setIsHighlightInit(true);
  }, [highlights]);

  useEffect(() => {
    if (isViewerReady && isHighlightInit && selectedHighlightId) {
      goTo(selectedHighlightId);
    }
  }, [goTo, isViewerReady, isHighlightInit, selectedHighlightId]);

  useEffect(() => {
    if (!isViewerReady || !zoom) return;
    if (zoom === AUTO_ZOOM_ID) {
      viewerRef.current?.setZoom?.(ZoomMode.AUTO);
    } else if (zoom === FIT_ZOOM_ID) {
      viewerRef.current?.setZoom?.(ZoomMode.PAGE_FIT);
    } else {
      const zoomValue = parseFloat(zoom);
      if (!Number.isNaN(zoomValue) && zoomValue > 0) {
        viewerRef.current?.setZoom?.(zoomValue);
      }
    }
  }, [isViewerReady, zoom]);

  useEffect(() => {
    if (isViewerReady && selectedPageNumber) {
      viewerRef.current?.setPage?.(selectedPageNumber);
    }
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
      navigateToPage: (page) => viewer.setPage?.(page),
    });
  }, [isViewerReady]);

  return (
    <div
      ref={containerRef}
      className={mergeClasses(
        'grow min-w-0 overflow-auto bg-layer-3',
        containerClassName,
      )}
    />
  );
};
