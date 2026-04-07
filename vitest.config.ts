import path from 'path';

import {
  configDefaults,
  defineConfig,
  coverageConfigDefaults,
} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    include: ['**/*.spec.tsx', '**/*.test.tsx', '**/*.test.ts', '**/*.spec.ts'],
    setupFiles: ['./setupTests.ts'],
    coverage: {
      reportsDirectory: './coverage/',
      reporter: ['text', 'json', 'html'],
      provider: 'v8',
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
      exclude: [
        ...coverageConfigDefaults.exclude,
        '**/*.stories.tsx',
        'storybook-static/**',
        '**/*storybook*',
        '.storybook/**',
        '**/index.ts',
        '*.config.[jt]s',
        'tools/**',
        'src/mcp/**',
      ],
    },
    reporters: 'verbose',
    exclude: [...configDefaults.exclude],
  },
});
