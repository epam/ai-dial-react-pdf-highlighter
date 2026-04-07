import '@epam/ai-dial-ui-kit/styles.css';
import type { Preview } from '@storybook/react';
import { createElement } from 'react';
import '../src/index.css';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) =>
      createElement('div', { className: 'text-primary' }, createElement(Story)),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      options: {
        dark: { name: 'dark', value: '#141414' },
        light: { name: 'light', value: '#ffffff' },
      },
    },
  },
  initialGlobals: {
    backgrounds: { value: '#141414' },
  },
};

export default preview;
