// Components
export { PDFViewer } from './components/PdfViewer/PdfViewer';
export type {
  PdfViewerApi,
  PdfViewerProps,
} from './components/PdfViewer/PdfViewer';

export { DocumentPreview } from './components/DocumentPreview/DocumentPreview';
export type { DocumentPreviewProps } from './components/DocumentPreview/DocumentPreview';

export {
  DocumentPreviewCacheProvider,
  useDocumentPreviewCache,
} from './components/DocumentPreviewCacheContext/DocumentPreviewCacheContext';

export { PdfPreviewLoader } from './components/PdfPreviewLoader/PdfPreviewLoader';
export type { PdfPreviewLoaderProps } from './components/PdfPreviewLoader/PdfPreviewLoader';

export { PageThumbnail } from './components/PageThumbnail/PageThumbnail';
export type { PageThumbnailProps } from './components/PageThumbnail/PageThumbnail';

// Constants
export {
  AUTO_ZOOM_ID,
  FIT_ZOOM_ID,
  THUMBNAIL_BATCH_SIZE,
  THUMBNAIL_IMAGE_OPTIONS,
  ZOOM_OPTIONS,
} from './constants/pdf-viewer.constants';
export type { ZoomOption } from './constants/pdf-viewer.constants';

// Utils
export { isPdfFile } from './utils/isPdfFile';
export { getStepZoomOptionValue } from './utils/pdf-viewer.utils';
