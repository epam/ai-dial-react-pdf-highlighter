import '@epam/ai-dial-ui-kit/styles.css';
import type { Decorator, Preview } from '@storybook/react';
import { createElement } from 'react';
import '../src/index.css';
import './themes.css';

/*
 * Applies a DIAL Chat theme the way the chat's ThemeProvider does: the theme's
 * colour variables (see `themes.css`) go on the document root, so the library's
 * tokens and the UI kit resolve to the same palette and shadows as in the chat.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string | undefined) ?? 'light';

  document.documentElement.dataset.theme = theme;

  return createElement(
    'div',
    { className: 'text-primary' },
    createElement(Story),
  );
};

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'DIAL Chat theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    // `themes.css` paints the canvas with the theme's `bg-layer-base`.
    backgrounds: { disable: true },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;
