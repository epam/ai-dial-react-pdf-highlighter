import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  staticDirs: ['../assets'],
  addons: [
    '@storybook/addon-docs',
    '@storybook/addon-a11y',
    '@storybook/addon-vitest',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async (config) => {
    config.optimizeDeps ??= {};
    config.optimizeDeps.exclude = [
      ...(config.optimizeDeps.exclude ?? []),
      '@tabler/icons-react',
    ];
    return config;
  },
};

export default config;
