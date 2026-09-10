import {
  ElementSize,
  EllipsisTooltip,
  IconButton,
  mergeClasses,
  Select,
} from '@epam/ai-dial-ui-kit';
import type {
  InputHighlightData,
  ViewerOptions,
} from '@epam/pdf-highlighter-kit';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import { type FC, type ReactNode } from 'react';

import { PdfPreviewLoader } from '@/components/PdfPreviewLoader/PdfPreviewLoader';
import type { PdfViewerApi } from '@/models/pdf-viewer.models';
import { PDFViewer } from '@/components/PdfViewer/PdfViewer';
import { useDocumentPreview } from '@/hooks/useDocumentPreview';

/**
 * Props for the high-level document preview component.
 *
 * The component handles file loading, optional cache integration, toolbar controls,
 * highlight navigation, and thumbnail generation.
 */
export interface DocumentPreviewProps {
  /** URL passed to {@link loadFileCb} to fetch the PDF file. */
  fileUrl: string;
  /** Display name used for PDF type detection. Falls back to {@link fileUrl}. */
  fileName?: string;
  /**
   * Caller-provided file loader.
   * If the cache provider is mounted, this callback is used as the cache miss loader.
   */
  loadFileCb: (url: string) => Promise<Blob>;
  /** Highlight data rendered by the underlying PDF viewer. */
  highlights: InputHighlightData[];
  /** Custom label shown when file loading fails. */
  errorLabel?: ReactNode;
  /** Label used before the highlights occurrence counter. */
  occurrencesLabel?: ReactNode;
  /** Label shown when the file type is not a supported PDF. */
  unsupportedLabel?: ReactNode;
  /** Show occurrence counter in the toolbar. Default: `true`. */
  showOccurrences?: boolean;
  /** Navigate viewer to this page when provided. */
  selectedPageNumber?: number;
  /** Additional class name for the inner {@link PDFViewer} container. */
  pdfViewerClassName?: string;
  /** Additional class name for the outer wrapper container. */
  containerClassName?: string;
  /** Callback invoked when total page count is known. */
  onTotalPagesChange?: (totalPages: number) => void;
  /** Optional title shown in the toolbar center. */
  title?: string;
  /** Page numbers for which thumbnails should be generated in batches. */
  thumbnailPageNumbers?: number[];
  /** Called incrementally after each thumbnail batch resolves. */
  onThumbnailsLoaded?: (map: Map<number, string>) => void;
  /** Called when the underlying viewer is ready and its imperative API is available. */
  onViewerReady?: (api: PdfViewerApi) => void;
  /**
   * Called with the 1-based page number whenever the viewport's
   * most-visible page changes, including changes driven by the reader
   * scrolling the document rather than an explicit page navigation.
   */
  onCurrentPageChange?: (page: number) => void;
  /** Forces the loading overlay visible while parent-level work is in progress. */
  showLoaderOverlay?: boolean;
  /** Restricts viewer loading to selected pages only. */
  selectedPages?: number[];
  /**
   * Highlight id to navigate to. When `showOccurrences` is true the internal
   * occurrence counter takes precedence; pass this when `showOccurrences` is
   * false to drive navigation externally (e.g. from a results table).
   */
  selectedHighlightId?: string;
  /**
   * Override or extend low-level viewer initialization options passed to `PDFViewer`.
   * Values are merged on top of the defaults (`enableTextSelection: true`,
   * `enableVirtualScrolling: true`, `bboxOrigin: 'top-left'`).
   */
  viewerOptions?: ViewerOptions;
}

/**
 * High-level PDF preview component with toolbar, highlight navigation, zoom controls,
 * loading and error overlays, and optional thumbnail generation.
 */
export const DocumentPreview: FC<DocumentPreviewProps> = ({
  fileUrl,
  fileName,
  errorLabel,
  occurrencesLabel,
  unsupportedLabel,
  highlights,
  loadFileCb,
  showOccurrences = true,
  selectedPageNumber,
  containerClassName,
  pdfViewerClassName,
  onTotalPagesChange,
  title,
  thumbnailPageNumbers,
  onThumbnailsLoaded,
  onViewerReady,
  onCurrentPageChange,
  showLoaderOverlay = false,
  selectedPages,
  selectedHighlightId,
  viewerOptions,
}) => {
  const {
    file,
    isError,
    isSupportedFile,
    activeHighlightIndex,
    zoom,
    setZoom,
    zoomSelectOptions,
    showLoader,
    changeIndex,
    handleZoomChange,
    handleViewerReady,
  } = useDocumentPreview({
    fileUrl,
    fileName,
    loadFileCb,
    highlights,
    selectedPageNumber,
    onTotalPagesChange,
    thumbnailPageNumbers,
    onThumbnailsLoaded,
    onViewerReady,
    showLoaderOverlay,
    selectedPages,
  });

  return (
    <div
      className={mergeClasses(
        'flex flex-col self-center gap-4 py-3 px-6 h-full w-full bg-layer-sunken',
        containerClassName,
      )}
    >
      {fileName && (
        <div className="shrink-0 min-h-0 w-full">
          <EllipsisTooltip
            className="dial-tiny-text text-secondary"
            text={fileName}
          />
        </div>
      )}
      <div
        className={mergeClasses(
          'flex w-full justify-between items-center',
          showOccurrences && title ? 'gap-2' : '',
        )}
      >
        <div>
          {showOccurrences ? (
            <div className="flex gap-1 py-0.5 px-1.5 min-h-[26px] items-center bg-layer-raised rounded w-fit">
              <span className="dial-small-text">
                {occurrencesLabel ?? 'Occurrences'}:
                <span className="pl-0.5 min-w-3 inline-block text-right">
                  {highlights.length > 0
                    ? `${activeHighlightIndex + 1}/${highlights.length}`
                    : '0'}
                </span>
              </span>

              {highlights.length > 0 && (
                <>
                  <IconButton
                    className="p-0 text-primary !h-6.5"
                    size={ElementSize.Small}
                    icon={<IconChevronDown size={16} />}
                    aria-label="Next occurrence"
                    onClick={() => changeIndex(1)}
                  />
                  <IconButton
                    className="p-0 text-primary !h-6.5"
                    size={ElementSize.Small}
                    icon={<IconChevronUp size={16} />}
                    aria-label="Previous occurrence"
                    onClick={() => changeIndex(-1)}
                  />
                </>
              )}
            </div>
          ) : (
            <div />
          )}
        </div>
        <div
          className={mergeClasses(
            'flex flex-1 items-center gap-4 min-w-0',
            title != null && title !== '' ? 'justify-between' : 'justify-end',
          )}
        >
          {title != null && title !== '' && (
            <EllipsisTooltip
              text={title}
              className="dial-body-semi-text text-primary min-w-0"
            />
          )}
          <div className="flex gap-0.5 items-center shrink-0">
            <div className="h-6">
              <Select
                size={ElementSize.Small}
                ariaLabel="Zoom"
                // 2.0 splits the scales: `className` is the outer container,
                // the field styling belongs on `fieldClassName`.
                fieldClassName="bg-control-neutral !py-0 h-6 min-h-6 dial-small-text max-h-full border-transparent hover:border-accent-alpha rounded"
                options={zoomSelectOptions}
                value={zoom}
                onChange={(v) => setZoom(v as string)}
              />
            </div>
            <IconButton
              className="py-0 rounded text-primary bg-control-neutral border border-transparent hover:border-accent-alpha"
              icon={<IconMinus size={16} />}
              aria-label="Zoom out"
              size={ElementSize.Small}
              onClick={() => handleZoomChange(-1)}
            />
            <IconButton
              className="py-0 rounded text-primary bg-control-neutral border border-transparent hover:border-accent-alpha"
              icon={<IconPlus size={16} />}
              aria-label="Zoom in"
              size={ElementSize.Small}
              onClick={() => handleZoomChange(1)}
            />
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {file && (
          <PDFViewer
            pdf={file}
            highlights={highlights}
            selectedHighlightId={
              showOccurrences
                ? highlights[activeHighlightIndex]?.id
                : selectedHighlightId
            }
            selectedPageNumber={selectedPageNumber}
            zoom={zoom}
            onTotalPagesChange={onTotalPagesChange}
            onViewerReady={handleViewerReady}
            onCurrentPageChange={onCurrentPageChange}
            containerClassName={pdfViewerClassName}
            selectedPages={selectedPages}
            viewerOptions={viewerOptions}
          />
        )}

        {showLoader && <PdfPreviewLoader className="absolute inset-0 z-10" />}

        {isError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-layer-raised">
            <div className="flex flex-col items-center gap-6 p-10">
              <IconAlertTriangle
                size={60}
                stroke={2}
                className="text-secondary"
              />
              <div className="text-center dial-small-text whitespace-pre-wrap">
                {!isSupportedFile && unsupportedLabel
                  ? unsupportedLabel
                  : (errorLabel ?? 'Failed to load document.')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
