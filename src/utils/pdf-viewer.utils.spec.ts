import { describe, expect, it } from 'vitest';

import { getStepZoomOptionValue, isPdfFile } from './pdf-viewer.utils';

describe('getStepZoomOptionValue', () => {
  it('uses the next defined zoom option when zooming in from a non-option zoom', () => {
    expect(getStepZoomOptionValue('auto', 1, 1.1)).toBe('1.25');
  });

  it('uses the previous defined zoom option when zooming out from a non-option zoom', () => {
    expect(getStepZoomOptionValue('auto', -1, 1.1)).toBe('1');
  });

  it('keeps stepping through defined zoom options on repeated changes', () => {
    const firstZoomIn = getStepZoomOptionValue('auto', 1, 1.1);
    const secondZoomIn = getStepZoomOptionValue(firstZoomIn, 1, 1.1);
    const zoomOut = getStepZoomOptionValue(secondZoomIn, -1, 1.1);

    expect(firstZoomIn).toBe('1.25');
    expect(secondZoomIn).toBe('1.5');
    expect(zoomOut).toBe('1.25');
  });

  it('clamps to the smallest and largest defined zoom options', () => {
    expect(getStepZoomOptionValue('0.5', -1, 0.5)).toBe('0.5');
    expect(getStepZoomOptionValue('3', 1, 3)).toBe('3');
  });
});

describe('isPdfFile', () => {
  it('returns true for a file with a .pdf extension', () => {
    expect(isPdfFile('document.pdf')).toBe(true);
  });

  it('returns true for a file with application/pdf content type', () => {
    expect(isPdfFile(undefined, 'application/pdf')).toBe(true);
  });

  it('returns false for a file without a .pdf extension or application/pdf content type', () => {
    expect(isPdfFile('image.png', 'image/png')).toBe(false);
  });

  it('handles null and undefined values gracefully', () => {
    expect(isPdfFile(null, null)).toBe(false);
    expect(isPdfFile(undefined, undefined)).toBe(false);
  });
});
