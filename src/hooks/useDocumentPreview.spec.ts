import { act, renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AUTO_ZOOM_ID } from '@/constants/pdf-viewer.constants';
import type { UseDocumentPreviewOptions } from '@/models/document-preview.models';
import type { PdfViewerApi } from '@/models/pdf-viewer.models';

import { useDocumentPreview } from './useDocumentPreview';

const mockBlob = new Blob(['%PDF-1.4'], { type: 'application/pdf' });

const defaultOptions: UseDocumentPreviewOptions = {
  fileUrl: 'https://example.com/test.pdf',
  loadFileCb: vi.fn().mockResolvedValue(mockBlob),
  highlights: [],
};

function renderUseDocumentPreview(
  options: Partial<UseDocumentPreviewOptions> = {},
) {
  return renderHook(() =>
    useDocumentPreview({ ...defaultOptions, ...options }),
  );
}

describe('useDocumentPreview', () => {
  describe('isSupportedFile', () => {
    it('is true when fileName has a .pdf extension', () => {
      const { result } = renderUseDocumentPreview({
        fileName: 'report.pdf',
        fileUrl: 'https://example.com/api/files/123',
      });

      expect(result.current.isSupportedFile).toBe(true);
    });

    it('is false when fileName has a non-PDF extension', () => {
      const { result } = renderUseDocumentPreview({
        fileName: 'report.docx',
        fileUrl: 'https://example.com/report.docx',
      });

      expect(result.current.isSupportedFile).toBe(false);
    });

    it('is true when fileUrl path has a .pdf extension and no fileName is given', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/document.pdf',
      });

      expect(result.current.isSupportedFile).toBe(true);
    });

    it('is false when fileUrl path has a non-PDF extension and no fileName is given', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/document.docx',
      });

      expect(result.current.isSupportedFile).toBe(false);
    });

    it('is true when fileUrl path has no extension and no fileName is given', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/api/files/123',
      });

      expect(result.current.isSupportedFile).toBe(true);
    });

    it('is true when fileUrl has query parameters but a .pdf pathname and no fileName', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/document.pdf?token=abc&v=2',
      });

      expect(result.current.isSupportedFile).toBe(true);
    });

    it('is false when fileUrl has a non-PDF extension even with query parameters', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/document.docx?token=abc',
      });

      expect(result.current.isSupportedFile).toBe(false);
    });

    it('is true for a relative URL with no file extension', () => {
      const { result } = renderUseDocumentPreview({
        fileUrl: '/api/preview/42',
      });

      expect(result.current.isSupportedFile).toBe(true);
    });
  });

  describe('file loading', () => {
    it('calls loadFileCb with the fileUrl', async () => {
      const loadFileCb = vi.fn().mockResolvedValue(mockBlob);

      renderUseDocumentPreview({ loadFileCb });

      await waitFor(() =>
        expect(loadFileCb).toHaveBeenCalledWith('https://example.com/test.pdf'),
      );
    });

    it('sets file after successful load', async () => {
      const { result } = renderUseDocumentPreview();

      await waitFor(() => expect(result.current.file).toBe(mockBlob));
    });

    it('sets isError when loadFileCb rejects', async () => {
      const { result } = renderUseDocumentPreview({
        loadFileCb: vi.fn().mockRejectedValue(new Error('network error')),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.file).toBeNull();
    });

    it('sets isError when the file type is not supported', async () => {
      const loadFileCb = vi.fn().mockResolvedValue(mockBlob);

      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/report.docx',
        loadFileCb,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(loadFileCb).not.toHaveBeenCalled();
    });

    it('loads successfully when fileUrl has no extension and no fileName', async () => {
      const loadFileCb = vi.fn().mockResolvedValue(mockBlob);

      const { result } = renderUseDocumentPreview({
        fileUrl: 'https://example.com/api/files/123',
        loadFileCb,
      });

      await waitFor(() => expect(result.current.file).toBe(mockBlob));
      expect(result.current.isError).toBe(false);
    });

    it('starts with isLoading true and transitions to false after load', async () => {
      let resolve!: (b: Blob) => void;
      const loadFileCb = vi.fn<() => Promise<Blob>>(
        () =>
          new Promise((res) => {
            resolve = res;
          }),
      );

      const { result } = renderUseDocumentPreview({ loadFileCb });

      expect(result.current.isLoading).toBe(true);

      await act(async () => resolve(mockBlob));

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('highlight navigation', () => {
    const highlights: UseDocumentPreviewOptions['highlights'] = [
      { id: '1', bboxes: [] },
      { id: '2', bboxes: [] },
      { id: '3', bboxes: [] },
    ];

    it('starts at index 0', () => {
      const { result } = renderUseDocumentPreview({ highlights });

      expect(result.current.activeHighlightIndex).toBe(0);
    });

    it('advances the index forward', () => {
      const { result } = renderUseDocumentPreview({ highlights });

      act(() => result.current.changeIndex(1));

      expect(result.current.activeHighlightIndex).toBe(1);
    });

    it('wraps forward past the last highlight', () => {
      const { result } = renderUseDocumentPreview({ highlights });

      act(() => result.current.changeIndex(1));
      act(() => result.current.changeIndex(1));
      act(() => result.current.changeIndex(1));

      expect(result.current.activeHighlightIndex).toBe(0);
    });

    it('wraps backward before the first highlight', () => {
      const { result } = renderUseDocumentPreview({ highlights });

      act(() => result.current.changeIndex(-1));

      expect(result.current.activeHighlightIndex).toBe(2);
    });
  });

  describe('zoom', () => {
    it('starts with the auto zoom id', () => {
      const { result } = renderUseDocumentPreview();

      expect(result.current.zoom).toBe(AUTO_ZOOM_ID);
    });

    it('updates zoom via setZoom', () => {
      const { result } = renderUseDocumentPreview();

      act(() => result.current.setZoom('1.5'));

      expect(result.current.zoom).toBe('1.5');
    });

    it('adds a custom zoom option when zoom is a non-preset numeric value', () => {
      const { result } = renderUseDocumentPreview();

      act(() => result.current.setZoom('1.23'));

      const custom = result.current.zoomSelectOptions.find(
        (o) => o.value === '1.23',
      );
      expect(custom).toBeDefined();
      expect(custom?.label).toBe('123%');
    });
  });

  describe('showLoader', () => {
    it('is true while the file is loading', () => {
      const { result } = renderUseDocumentPreview({
        loadFileCb: () =>
          new Promise(() => {
            /* never resolves */
          }),
      });

      expect(result.current.showLoader).toBe(true);
    });

    it('is true when showLoaderOverlay is set even after load completes', async () => {
      const { result } = renderUseDocumentPreview({ showLoaderOverlay: true });

      await waitFor(() => expect(result.current.file).toBe(mockBlob));
      expect(result.current.showLoader).toBe(true);
    });

    it('is false after a load error', async () => {
      const { result } = renderUseDocumentPreview({
        loadFileCb: vi.fn().mockRejectedValue(new Error()),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.showLoader).toBe(false);
    });
  });

  describe('handleViewerReady', () => {
    it('exposes the viewer api through viewerApiRef after handleViewerReady is called', () => {
      const { result } = renderUseDocumentPreview();
      const mockApi = { getZoom: vi.fn() } as unknown as PdfViewerApi;

      act(() => result.current.handleViewerReady(mockApi));

      expect(result.current.viewerApiRef.current).toBe(mockApi);
    });

    it('calls the onViewerReady callback', () => {
      const onViewerReady = vi.fn();
      const { result } = renderUseDocumentPreview({ onViewerReady });
      const mockApi = { getZoom: vi.fn() } as unknown as PdfViewerApi;

      act(() => result.current.handleViewerReady(mockApi));

      expect(onViewerReady).toHaveBeenCalledWith(mockApi);
    });
  });
});
