export const AUTO_ZOOM_ID = 'auto';
export const FIT_ZOOM_ID = 'page-fit';

export interface ZoomOption {
  value: string;
  label: string;
}

export const ZOOM_OPTIONS: ZoomOption[] = [
  { value: AUTO_ZOOM_ID, label: 'Auto' },
  { value: FIT_ZOOM_ID, label: 'Page Fit' },
  { value: '0.5', label: '50%' },
  { value: '0.75', label: '75%' },
  { value: '1', label: '100%' },
  { value: '1.25', label: '125%' },
  { value: '1.5', label: '150%' },
  { value: '2', label: '200%' },
  { value: '3', label: '300%' },
];

export const THUMBNAIL_IMAGE_OPTIONS = {
  maxWidth: 104,
  format: 'image/jpeg' as const,
  quality: 0.85,
};

export const THUMBNAIL_BATCH_SIZE = 15;
