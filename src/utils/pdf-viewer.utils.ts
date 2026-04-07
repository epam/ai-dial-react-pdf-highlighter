import { ZOOM_OPTIONS } from '@/constants/pdf-viewer.constants';

const NUMERIC_ZOOM_OPTIONS = ZOOM_OPTIONS.filter(({ value }) => {
  const zoomValue = Number.parseFloat(value);
  return !Number.isNaN(zoomValue) && zoomValue > 0;
});

const NUMERIC_ZOOM_OPTIONS_DESC = [...NUMERIC_ZOOM_OPTIONS].reverse();

export const getStepZoomOptionValue = (
  currentZoom: string,
  direction: 1 | -1,
  actualZoom?: number,
) => {
  if (NUMERIC_ZOOM_OPTIONS.length === 0) {
    return currentZoom;
  }

  const currentZoomValue = Number.parseFloat(currentZoom);
  const effectiveZoom =
    !Number.isNaN(currentZoomValue) && currentZoomValue > 0
      ? currentZoomValue
      : actualZoom;
  const normalizedZoom =
    typeof effectiveZoom === 'number' && effectiveZoom > 0
      ? effectiveZoom
      : Number.parseFloat(NUMERIC_ZOOM_OPTIONS[0].value);

  if (direction === 1) {
    return (
      NUMERIC_ZOOM_OPTIONS.find(
        ({ value }) => Number.parseFloat(value) > normalizedZoom,
      ) ?? NUMERIC_ZOOM_OPTIONS[NUMERIC_ZOOM_OPTIONS.length - 1]
    ).value;
  }

  return (
    NUMERIC_ZOOM_OPTIONS_DESC.find(
      ({ value }) => Number.parseFloat(value) < normalizedZoom,
    ) ?? NUMERIC_ZOOM_OPTIONS[0]
  ).value;
};
