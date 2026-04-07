import {
  DialButton,
  DialEllipsisTooltip,
  DialSelect,
  ElementSize,
  mergeClasses,
  SelectSize,
} from '@epam/ai-dial-ui-kit';
import type { InputHighlightData } from '@epam/pdf-highlighter-kit';
import {
  IconAlertTriangle,
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconPlus,
} from '@tabler/icons-react';
import {
  type FC,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { useDocumentPreviewCache } from '@/components/DocumentPreviewCacheContext/DocumentPreviewCacheContext';
import { PdfPreviewLoader } from '@/components/PdfPreviewLoader/PdfPreviewLoader';
import type { PdfViewerApi } from '@/components/PdfViewer/PdfViewer';
import { PDFViewer } from '@/components/PdfViewer/PdfViewer';
import {
  AUTO_ZOOM_ID,
  FIT_ZOOM_ID,
  THUMBNAIL_BATCH_SIZE,
  THUMBNAIL_IMAGE_OPTIONS,
  ZOOM_OPTIONS,
} from '@/constants/pdf-viewer.constants';
import { isPdfFile } from '@/utils/isPdfFile';
import { getStepZoomOptionValue } from '@/utils/pdf-viewer.utils';

const BASE_ZOOM_SELECT_OPTIONS = ZOOM_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

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
  /** Forces the loading overlay visible while parent-level work is in progress. */
  showLoaderOverlay?: boolean;
  /** Restricts viewer loading to selected pages only. */
  selectedPages?: number[];
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
  showLoaderOverlay = false,
  selectedPages,
}) => {
  const cache = useDocumentPreviewCache();
  const viewerApiRef = useRef<PdfViewerApi | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const [zoom, setZoom] = useState(AUTO_ZOOM_ID);

  const isPdfFileByName = useMemo(() => {
    let value = fileName || fileUrl;
    if (!fileName) {
      try {
        value = new URL(fileUrl).pathname;
      } catch {
        value = fileUrl.split('?')[0].split('#')[0];
      }
    }
    return isPdfFile({ name: value.toLowerCase() });
  }, [fileName, fileUrl]);

  const changeIndex = useCallback(
    (dir: 1 | -1) => {
      setCurrentIndex(
        (currentIndex + dir + highlights.length) % highlights.length,
      );
    },
    [currentIndex, highlights.length],
  );

  const handleZoomChange = useCallback(
    (dir?: 1 | -1) => {
      const api = viewerApiRef.current;
      if (!api?.getZoom || !dir) {
        return;
      }
      setZoom(getStepZoomOptionValue(zoom, dir, api.getZoom()));
    },
    [zoom],
  );

  const zoomSelectOptions = useMemo(() => {
    const isPreset =
      zoom === AUTO_ZOOM_ID ||
      zoom === FIT_ZOOM_ID ||
      ZOOM_OPTIONS.some((opt) => opt.value === zoom);
    if (!isPreset) {
      const num = parseFloat(zoom);
      if (!Number.isNaN(num) && num > 0) {
        return [
          ...BASE_ZOOM_SELECT_OPTIONS,
          { value: zoom, label: `${Math.round(num * 100)}%` },
        ];
      }
    }
    return BASE_ZOOM_SELECT_OPTIONS;
  }, [zoom]);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setIsError(false);
    setFile(null);
    setViewerReady(false);
    viewerApiRef.current = null;

    if (!isPdfFileByName) {
      setIsError(true);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      try {
        const loaded = await (cache
          ? cache.getFile(fileUrl, () => loadFileCb(fileUrl))
          : loadFileCb(fileUrl));
        if (!cancelled) {
          setFile(loaded);
        }
      } catch {
        if (!cancelled) {
          setIsError(true);
          setFile(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [fileUrl, cache, loadFileCb, isPdfFileByName]);

  const handleViewerReady = useCallback(
    (api: PdfViewerApi) => {
      viewerApiRef.current = api;
      setViewerReady(true);
      onViewerReady?.(api);
    },
    [onViewerReady],
  );

  useEffect(() => {
    const pageNumbers = thumbnailPageNumbers ?? [];
    const getThumbnails = viewerApiRef.current?.getThumbnailsDataUrl;
    if (
      !pageNumbers.length ||
      !getThumbnails ||
      !file ||
      !onThumbnailsLoaded ||
      !viewerReady
    )
      return;

    let cancelled = false;

    const runBatches = async () => {
      const cumulative = new Map<number, string>();
      for (let i = 0; i < pageNumbers.length; i += THUMBNAIL_BATCH_SIZE) {
        if (cancelled) break;
        const batch = pageNumbers.slice(i, i + THUMBNAIL_BATCH_SIZE);
        try {
          const batchMap = await getThumbnails(batch, THUMBNAIL_IMAGE_OPTIONS);
          if (cancelled) break;
          batchMap.forEach((url, page) => cumulative.set(page, url));
          onThumbnailsLoaded(new Map(cumulative));
        } catch (err) {
          console.warn('Thumbnail batch load failed:', err);
          break;
        }
      }
    };

    runBatches();

    return () => {
      cancelled = true;
    };
  }, [thumbnailPageNumbers, file, onThumbnailsLoaded, viewerReady]);

  const shouldShowPreviewLoader =
    !isError && (Boolean(isLoading) || showLoaderOverlay);

  return (
    <div
      className={mergeClasses(
        'flex flex-col self-center gap-4 py-3 px-6 h-full w-full bg-layer-2',
        containerClassName,
      )}
    >
      {fileName && (
        <DialEllipsisTooltip
          className="dial-tiny-text text-secondary"
          text={fileName}
        />
      )}
      <div
        className={mergeClasses(
          'flex w-full justify-between items-center',
          showOccurrences && title ? 'gap-2' : '',
        )}
      >
        <div>
          {showOccurrences ? (
            <div className="flex gap-1 py-0.5 px-1.5 min-h-[26px] items-center bg-layer-4 rounded w-fit">
              <span className="dial-small-text">
                {occurrencesLabel ?? 'Occurrences'}:
                <span className="pl-0.5 min-w-3 inline-block text-right">
                  {highlights.length > 0
                    ? `${currentIndex + 1}/${highlights.length}`
                    : '0'}
                </span>
              </span>

              {highlights.length > 0 && (
                <>
                  <DialButton
                    className="p-0 text-primary !h-6.5"
                    size={ElementSize.Small}
                    iconAfter={<IconChevronDown size={16} />}
                    aria-label="Next occurrence"
                    onClick={() => changeIndex(1)}
                  />
                  <DialButton
                    className="p-0 text-primary !h-6.5"
                    size={ElementSize.Small}
                    iconAfter={<IconChevronUp size={16} />}
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
            <DialEllipsisTooltip
              text={title}
              className="dial-body-semi-text text-primary min-w-0"
            />
          )}
          <div className="flex gap-0.5 items-center shrink-0">
            <div className="h-6">
              <DialSelect
                size={SelectSize.Sm}
                className="bg-layer-4 !py-0 h-6 min-h-6 dial-small-text max-h-full border-transparent hover:border-hover rounded"
                options={zoomSelectOptions}
                value={zoom}
                onChange={(v) => setZoom(v as string)}
              />
            </div>
            <DialButton
              className="py-0 flex items-center justify-center rounded text-primary bg-layer-4 border border-transparent hover:border-hover"
              iconAfter={<IconMinus size={16} />}
              aria-label="Zoom out"
              size={ElementSize.Small}
              onClick={() => handleZoomChange(-1)}
            />
            <DialButton
              className="py-0 flex items-center justify-center rounded text-primary bg-layer-4 border border-transparent hover:border-hover"
              iconAfter={<IconPlus size={16} />}
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
            selectedHighlightId={highlights[currentIndex]?.id}
            selectedPageNumber={selectedPageNumber}
            zoom={zoom}
            onTotalPagesChange={onTotalPagesChange}
            onViewerReady={handleViewerReady}
            containerClassName={pdfViewerClassName}
            selectedPages={selectedPages}
          />
        )}

        {shouldShowPreviewLoader && (
          <PdfPreviewLoader className="absolute inset-0 z-10" />
        )}

        {isError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-layer-3">
            <div className="flex flex-col items-center gap-6 p-10">
              <IconAlertTriangle
                size={60}
                stroke={2}
                className="text-secondary"
              />
              <div className="text-center dial-small-text whitespace-pre-wrap">
                {!isPdfFileByName && unsupportedLabel
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
