import { Checkbox, mergeClasses, Spinner } from '@epam/ai-dial-ui-kit';
import { type FC } from 'react';

/**
 * Props for a selectable page thumbnail tile.
 */
export interface PageThumbnailProps {
  /** 1-based page number displayed by the tile. */
  pageNum: number;
  /** Called when the tile or its checkbox selects/deselects the page. */
  onSelectPage: (pageNum: number) => void;
  /** Whether this page is currently selected. */
  isSelected: boolean;
  /** Whether thumbnail content is currently loading. */
  isLoading: boolean;
  /** Enables checkbox-driven multi-select mode. */
  isMultiselect?: boolean;
  /** Optional thumbnail image URL for the page. */
  thumbnailUrl?: string | null;
  /** Optional additional class name for the root element. */
  className?: string;
}

/**
 * Page thumbnail tile with optional multi-select support and loading overlay.
 */
export const PageThumbnail: FC<PageThumbnailProps> = ({
  pageNum,
  onSelectPage,
  isSelected,
  isLoading,
  isMultiselect,
  thumbnailUrl,
  className,
}) => {
  return (
    <button
      type="button"
      aria-label={`Page ${pageNum}`}
      aria-pressed={isSelected}
      onClick={(e) => {
        if (
          isMultiselect &&
          (e.target as HTMLElement).closest('[data-checkbox-wrapper]')
        )
          return;
        onSelectPage(pageNum);
      }}
      className={mergeClasses(
        'flex flex-col gap-2 p-2 h-[186px] w-[120px] items-center justify-center cursor-pointer transition-colors hover:bg-control-accent-alpha-hover rounded-sm',
        isSelected &&
          (isMultiselect
            ? 'border border-accent bg-control-accent-alpha'
            : 'border border-primary'),
        className,
      )}
    >
      <div className="relative w-[104px] h-[146px] bg-layer-raised rounded-sm overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={`Page ${pageNum} thumbnail`}
            className="w-full h-full object-cover rounded-sm"
          />
        ) : null}
        {isMultiselect && (
          <div className="absolute left-1 top-1 z-10" data-checkbox-wrapper>
            <Checkbox
              id={`page-thumbnail-${pageNum}`}
              isSelected={isSelected}
              onChange={() => onSelectPage(pageNum)}
              aria-label={`Select page ${pageNum}`}
            />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-backdrop rounded-sm">
            <Spinner
              size={24}
              fullWidth={false}
              ariaLabel={`Loading page ${pageNum}`}
            />
          </div>
        )}
      </div>
      <span className="dial-tiny-text text-primary">{pageNum}</span>
    </button>
  );
};
