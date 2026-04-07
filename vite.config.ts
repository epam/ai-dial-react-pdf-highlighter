import path from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import tailwindcss from 'tailwindcss';
import { peerDependencies } from './package.json';

export default defineConfig({
  plugins: [
    react(),
    dts({ exclude: ['**/*.stories.tsx', '**/*.spec.tsx', '**/*.spec.ts'] }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'ai-dial-react-pdf-highlighter',
      fileName: (format) => `ai-dial-react-pdf-highlighter.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['react/jsx-runtime', ...Object.keys(peerDependencies)],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@tabler/icons-react': 'TablerIcons',
          '@epam/ai-dial-ui-kit': 'DialUiKit',
          '@epam/pdf-highlighter-kit': 'PdfHighlighterKit',
        },
      },
    },
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
