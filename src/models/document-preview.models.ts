import type { InputHighlightData } from '@epam/pdf-highlighter-kit';

import type { PdfViewerApi } from '@/models/pdf-viewer.models';

export interface UseDocumentPreviewOptions {
  fileUrl: string;
  fileName?: string;
  loadFileCb: (url: string) => Promise<Blob>;
  highlights: InputHighlightData[];
  selectedPageNumber?: number;
  onTotalPagesChange?: (totalPages: number) => void;
  thumbnailPageNumbers?: number[];
  onThumbnailsLoaded?: (map: Map<number, string>) => void;
  onViewerReady?: (api: PdfViewerApi) => void;
  showLoaderOverlay?: boolean;
  selectedPages?: number[];
}

export interface UseDocumentPreviewResult {
  file: Blob | null;
  isLoading: boolean | null;
  isError: boolean;
  isSupportedFile: boolean;
  activeHighlightIndex: number;
  zoom: string;
  setZoom: (value: string) => void;
  zoomSelectOptions: { value: string; label: string }[];
  viewerApiRef: React.RefObject<PdfViewerApi | null>;
  showLoader: boolean;
  changeIndex: (dir: 1 | -1) => void;
  handleZoomChange: (dir?: 1 | -1) => void;
  handleViewerReady: (api: PdfViewerApi) => void;
}
