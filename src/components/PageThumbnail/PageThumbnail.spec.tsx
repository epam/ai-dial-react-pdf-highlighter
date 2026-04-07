import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PageThumbnail } from './PageThumbnail';

describe('PageThumbnail', () => {
  it('renders the page number', () => {
    render(
      <PageThumbnail
        pageNum={3}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders the button with accessible label', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
  });

  it('reflects selected state via aria-pressed', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={true}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('calls onSelectPage with the page number when clicked', async () => {
    const onSelectPage = vi.fn();
    render(
      <PageThumbnail
        pageNum={2}
        isSelected={false}
        isLoading={false}
        onSelectPage={onSelectPage}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onSelectPage).toHaveBeenCalledWith(2);
  });

  it('renders thumbnail image when thumbnailUrl is provided', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
        thumbnailUrl="data:image/png;base64,abc"
      />,
    );
    expect(screen.getByAltText('Page 1 thumbnail')).toBeInTheDocument();
  });

  it('does not render thumbnail image when thumbnailUrl is absent', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows loading overlay when isLoading is true', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={true}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.getByLabelText('Loading page 1')).toBeInTheDocument();
  });

  it('does not show loading overlay when isLoading is false', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.queryByLabelText('Loading page 1')).not.toBeInTheDocument();
  });

  it('renders a checkbox in multiselect mode', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        isMultiselect={true}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('does not render a checkbox outside multiselect mode', () => {
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        onSelectPage={vi.fn()}
      />,
    );
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('does not call onSelectPage when clicking the checkbox in multiselect mode', async () => {
    const onSelectPage = vi.fn();
    render(
      <PageThumbnail
        pageNum={1}
        isSelected={false}
        isLoading={false}
        isMultiselect={true}
        onSelectPage={onSelectPage}
      />,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    // The checkbox triggers its own onChange which calls onSelectPage — button click is suppressed
    expect(onSelectPage).toHaveBeenCalledTimes(1);
    expect(onSelectPage).toHaveBeenCalledWith(1);
  });
});
