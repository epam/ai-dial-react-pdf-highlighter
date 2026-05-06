// Components
export { PDFViewer } from './components/PdfViewer/PdfViewer';
export type { PdfViewerProps } from './components/PdfViewer/PdfViewer';

export { DocumentPreview } from './components/DocumentPreview/DocumentPreview';
export type { DocumentPreviewProps } from './components/DocumentPreview/DocumentPreview';

export { DocumentCacheProvider as DocumentPreviewCacheProvider } from './context/documentCacheProvider';

// Hooks
export { useDocumentPreviewCache } from './hooks/useDocumentPreviewCache';
export { useDocumentPreview } from './hooks/useDocumentPreview';
export type { UseDocumentPreviewResult } from './models/document-preview.models';

export { PdfPreviewLoader } from './components/PdfPreviewLoader/PdfPreviewLoader';
export type { PdfPreviewLoaderProps } from './components/PdfPreviewLoader/PdfPreviewLoader';

export { PageThumbnail } from './components/PageThumbnail/PageThumbnail';
export type { PageThumbnailProps } from './components/PageThumbnail/PageThumbnail';

// Models
export type { PdfViewerApi } from './models/pdf-viewer.models';
export type { ZoomOption } from './models/pdf-viewer.models';
export type { ViewerOptions } from '@epam/pdf-highlighter-kit';
export { RotationDirection } from '@epam/pdf-highlighter-kit';
export type { PageRotationDegrees } from '@epam/pdf-highlighter-kit';

// Constants
export {
  AUTO_ZOOM_ID,
  FIT_ZOOM_ID,
  THUMBNAIL_BATCH_SIZE,
  THUMBNAIL_IMAGE_OPTIONS,
  ZOOM_OPTIONS,
} from './constants/pdf-viewer.constants';

// Utils
export { getStepZoomOptionValue, isPdfFile } from './utils/pdf-viewer.utils';
