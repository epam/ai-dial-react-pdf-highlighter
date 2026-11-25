import {
  mergeClasses,
  Skeleton,
  SkeletonShimmer,
  SkeletonVariant,
} from '@epam/ai-dial-ui-kit';
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
      className={mergeClasses('h-full w-full bg-layer-raised', className)}
    >
      <SkeletonShimmer className="flex w-full flex-col gap-10 px-[60px] pt-10">
        <Skeleton
          variant={SkeletonVariant.Text}
          width={208}
          height={16}
          className="mx-auto max-w-[40%] bg-layer-sunken"
        />

        {['28%', '58%'].map((lastLineWidth) => (
          <div key={lastLineWidth} className="flex flex-col gap-4">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={index}
                variant={SkeletonVariant.Text}
                width="100%"
                height={16}
                className="bg-layer-sunken"
              />
            ))}
            <Skeleton
              variant={SkeletonVariant.Text}
              width={lastLineWidth}
              height={16}
              className="bg-layer-sunken"
            />
          </div>
        ))}
      </SkeletonShimmer>
    </div>
  );
};
