import { mergeClasses } from '@epam/ai-dial-ui-kit';
import { type FC } from 'react';

/**
 * Props for the PDF preview loading skeleton overlay.
 */
export interface PdfPreviewLoaderProps {
  /** Additional class name for the loader wrapper. */
  className?: string;
  /** Accessible label announced by assistive technologies. */
  ariaLabel?: string;
}

const sectionLineClassName =
  'h-4 rounded-[120px] bg-gradient-to-r from-layer-4 via-layer-3 to-layer-4 bg-[length:200%_100%] animate-skeleton-wave';

/**
 * Skeleton placeholder used while PDF content is loading.
 */
export const PdfPreviewLoader: FC<PdfPreviewLoaderProps> = ({
  className,
  ariaLabel = 'pdf preview loading',
}) => {
  return (
    <div
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      className={mergeClasses('h-full w-full bg-layer-3', className)}
    >
      <div className="flex h-full w-full flex-col gap-10 px-[60px] pt-10">
        <div className="mx-auto h-4 w-[208px] max-w-[40%] rounded-[120px] bg-gradient-to-r from-layer-4 via-layer-3 to-layer-4 bg-[length:200%_100%] animate-skeleton-wave" />

        <div className="flex flex-col gap-4">
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div
            className={mergeClasses(
              sectionLineClassName,
              'w-[28%] max-w-[320px]',
            )}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div className={sectionLineClassName} />
          <div
            className={mergeClasses(
              sectionLineClassName,
              'w-[58%] max-w-[520px]',
            )}
          />
        </div>
      </div>
    </div>
  );
};
