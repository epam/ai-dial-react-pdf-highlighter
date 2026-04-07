import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PdfPreviewLoader } from './PdfPreviewLoader';

describe('PdfPreviewLoader', () => {
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
    expect(screen.getByRole('status')).toHaveClass('custom-class');
  });

  it('has aria-live="polite" for non-intrusive announcements', () => {
    render(<PdfPreviewLoader />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });
});
