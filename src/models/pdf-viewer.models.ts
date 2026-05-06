import type {
  PageRotationDegrees,
  RotationDirection,
  ThumbnailOptions,
} from '@epam/pdf-highlighter-kit';

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
  /** Sets extra clockwise display rotation for a 1-based page (on top of PDF `/Rotate`). */
  setPageDisplayRotation: (
    pageNumber: number,
    degrees: PageRotationDegrees,
    direction?: RotationDirection,
  ) => void;
  /** Returns extra clockwise display rotation for a 1-based page. */
  getPageDisplayRotation: (pageNumber: number) => PageRotationDegrees;
}

export interface ZoomOption {
  value: string;
  label: string;
}
