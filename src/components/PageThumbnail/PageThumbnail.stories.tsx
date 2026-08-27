import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { PageThumbnail } from './PageThumbnail';

const DarkWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-layer-base p-4 rounded">{children}</div>
);

const meta = {
  title: 'Components/PageThumbnail',
  component: PageThumbnail,
  tags: ['autodocs'],
  args: {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onSelectPage: () => {},
  },
  decorators: [
    (Story) => (
      <DarkWrapper>
        <Story />
      </DarkWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A clickable page thumbnail button. Displays a page image with its page number, and optionally a checkbox for multi-select mode and a loading overlay.',
      },
    },
  },
  argTypes: {
    pageNum: { control: 'number' },
    isSelected: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isMultiselect: { control: 'boolean' },
    thumbnailUrl: { control: 'text' },
  },
} satisfies Meta<typeof PageThumbnail>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    pageNum: 1,
    isSelected: false,
    isLoading: false,
  },
};

export const WithThumbnail: Story = {
  args: {
    pageNum: 2,
    isSelected: false,
    isLoading: false,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+2',
  },
};

export const Selected: Story = {
  args: {
    pageNum: 3,
    isSelected: true,
    isLoading: false,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+3',
  },
};

export const Loading: Story = {
  args: {
    pageNum: 6,
    isSelected: false,
    isLoading: true,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+6',
  },
};

const PAGES = [
  {
    pageNum: 1,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+1',
  },
  {
    pageNum: 2,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+2',
  },
  {
    pageNum: 3,
    thumbnailUrl: 'https://placehold.co/104x146/e2e8f0/475569?text=Page+3',
  },
];

export const Multiselect: Story = {
  args: { pageNum: 1, isSelected: false, isLoading: false },
  decorators: [
    () => {
      const [selected, setSelected] = useState<Set<number>>(new Set());
      const toggle = (n: number) =>
        setSelected((prev) => {
          const next = new Set(prev);
          if (next.has(n)) next.delete(n);
          else next.add(n);
          return next;
        });
      return (
        <DarkWrapper>
          <div className="flex gap-2">
            {PAGES.map(({ pageNum, thumbnailUrl }) => (
              <PageThumbnail
                key={pageNum}
                pageNum={pageNum}
                thumbnailUrl={thumbnailUrl}
                isSelected={selected.has(pageNum)}
                isLoading={false}
                isMultiselect
                onSelectPage={toggle}
              />
            ))}
          </div>
        </DarkWrapper>
      );
    },
  ],
};

export const Singleselect: Story = {
  args: { pageNum: 1, isSelected: false, isLoading: false },
  decorators: [
    () => {
      const [selected, setSelected] = useState<number | null>(1);
      return (
        <DarkWrapper>
          <div className="flex gap-2">
            {PAGES.map(({ pageNum, thumbnailUrl }) => (
              <PageThumbnail
                key={pageNum}
                pageNum={pageNum}
                thumbnailUrl={thumbnailUrl}
                isSelected={selected === pageNum}
                isLoading={false}
                onSelectPage={setSelected}
              />
            ))}
          </div>
        </DarkWrapper>
      );
    },
  ],
};
