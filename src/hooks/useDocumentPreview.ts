import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { PdfViewerApi } from '@/models/pdf-viewer.models';
import {
  AUTO_ZOOM_ID,
  FIT_ZOOM_ID,
  THUMBNAIL_BATCH_SIZE,
  THUMBNAIL_IMAGE_OPTIONS,
  ZOOM_OPTIONS,
} from '@/constants/pdf-viewer.constants';
import { useDocumentPreviewCache } from '@/hooks/useDocumentPreviewCache';
import type {
  UseDocumentPreviewOptions,
  UseDocumentPreviewResult,
} from '@/models/document-preview.models';
import { getStepZoomOptionValue, isPdfFile } from '@/utils/pdf-viewer.utils';

const BASE_ZOOM_SELECT_OPTIONS = ZOOM_OPTIONS.map((opt) => ({
  value: opt.value,
  label: opt.label,
}));

/**
 * Encapsulates all logic for the document preview: file loading (with optional
 * cache integration), highlight index navigation, zoom state, and thumbnail
 * generation. Pair with a UI layer to build a custom document preview.
 */
export const useDocumentPreview = ({
  fileUrl,
  fileName,
  loadFileCb,
  highlights,
  selectedPageNumber: _selectedPageNumber,
  onTotalPagesChange: _onTotalPagesChange,
  thumbnailPageNumbers,
  onThumbnailsLoaded,
  onViewerReady,
  showLoaderOverlay = false,
  selectedPages: _selectedPages,
}: UseDocumentPreviewOptions): UseDocumentPreviewResult => {
  const cache = useDocumentPreviewCache();
  const viewerApiRef = useRef<PdfViewerApi | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const [activeHighlightIndex, setCurrentIndex] = useState(0);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean | null>(null);
  const [file, setFile] = useState<Blob | null>(null);
  const [zoom, setZoom] = useState(AUTO_ZOOM_ID);

  const isSupportedFile = useMemo(() => {
    if (fileName) {
      return isPdfFile(fileName.toLowerCase());
    }
    let pathname: string;
    try {
      pathname = new URL(fileUrl).pathname;
    } catch {
      pathname = fileUrl.split('?')[0].split('#')[0];
    }
    const lastSegment = pathname.split('/').pop() ?? '';
    const hasExtension = lastSegment.includes('.');
    return !hasExtension || isPdfFile(lastSegment.toLowerCase());
  }, [fileName, fileUrl]);

  const changeIndex = useCallback(
    (dir: 1 | -1) => {
      setCurrentIndex(
        (activeHighlightIndex + dir + highlights.length) % highlights.length,
      );
    },
    [activeHighlightIndex, highlights.length],
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

    if (!isSupportedFile) {
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
  }, [fileUrl, cache, loadFileCb, isSupportedFile]);

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

  const showLoader = !isError && (Boolean(isLoading) || showLoaderOverlay);

  return {
    file,
    isLoading,
    isError,
    isSupportedFile,
    activeHighlightIndex,
    zoom,
    setZoom,
    zoomSelectOptions,
    viewerApiRef,
    showLoader,
    changeIndex,
    handleZoomChange,
    handleViewerReady,
  };
};
