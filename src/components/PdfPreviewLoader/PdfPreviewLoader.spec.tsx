import { Skeleton, SkeletonVariant } from '@epam/ai-dial-ui-kit';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PdfPreviewLoader } from './PdfPreviewLoader';

vi.mock('@epam/ai-dial-ui-kit', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@epam/ai-dial-ui-kit')>();
  return { ...actual, Skeleton: vi.fn(actual.Skeleton) };
});

describe('PdfPreviewLoader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the PDF loading view from UI kit skeleton blocks', () => {
    render(<PdfPreviewLoader />);
    const calls = vi.mocked(Skeleton).mock.calls;
    expect(calls).toHaveLength(11);
    expect(calls.map(([props]) => props.width)).toEqual([
      208,
      '100%',
      '100%',
      '100%',
      '100%',
      '28%',
      '100%',
      '100%',
      '100%',
      '100%',
      '58%',
    ]);
    calls.forEach(([props]) => {
      expect(props.variant).toBe(SkeletonVariant.Text);
      expect(props.height).toBe(16);
      expect(props.className).toContain('bg-layer-sunken');
    });
  });
  it('renders with status role and default aria-label', () => {
    render(<PdfPreviewLoader />);
    expect(
      screen.getByRole('status', { name: 'pdf preview loading' }),
    ).toBeInTheDocument();
  });

  it('renders with a custom aria-label', () => {
    render(<PdfPreviewLoader ariaLabel="loading document" />);
    expect(
      screen.getByRole('status', { name: 'loading document' }),
    ).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(<PdfPreviewLoader className="custom-class" />);
    expect(
      screen.getByRole('status', { name: 'pdf preview loading' }),
    ).toHaveClass('custom-class');
  });

  it('has aria-live="polite" for non-intrusive announcements', () => {
    render(<PdfPreviewLoader />);
    expect(
      screen.getByRole('status', { name: 'pdf preview loading' }),
    ).toHaveAttribute('aria-live', 'polite');
  });
});
