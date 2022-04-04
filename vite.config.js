import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const path = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'giap',
      fileName: (format) => {
        if (format === 'umd') {
          return 'giap.js';
        }

        return `index.${format}.js`;
      },
      formats: ['cjs', 'es', 'umd'],
    },
    rollupOptions: {
      external: ['uuidv4'],
    },
    sourcemap: true,
  },
});
