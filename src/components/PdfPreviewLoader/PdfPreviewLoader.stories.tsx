import type { Meta, StoryObj } from '@storybook/react-vite';

import { PdfPreviewLoader } from './PdfPreviewLoader';
import type { PdfPreviewLoaderProps } from './PdfPreviewLoader';

const meta = {
  title: 'Components/PdfPreviewLoader',
  component: PdfPreviewLoader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'PDF-shaped loading view composed of UI kit Skeleton blocks inside SkeletonShimmer. Used while PDFViewer initializes; it can also be used as an overlay (`absolute inset-0`) or as a full-height fill.',
      },
    },
  },
  argTypes: {
    className: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
} satisfies Meta<PdfPreviewLoaderProps>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ariaLabel: 'pdf preview loading',
  },
  decorators: [
    (Story) => (
      <div className="h-[600px] w-[500px]">
        <Story />
      </div>
    ),
  ],
};
