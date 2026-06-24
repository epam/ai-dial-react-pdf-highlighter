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

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
  initialGlobals: {
    backgrounds: { value: '#141414' },
  },
};

export default preview;
