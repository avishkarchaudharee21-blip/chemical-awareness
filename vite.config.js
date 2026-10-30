import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        explore: resolve(__dirname, 'explore.html'),
        product: resolve(__dirname, 'product.html'),
        survey: resolve(__dirname, 'survey.html'),
        methodology: resolve(__dirname, 'methodology.html'),
        about: resolve(__dirname, 'about.html')
      }
    }
  },
  server: {
    port: 3000,
    open: false
  }
});
