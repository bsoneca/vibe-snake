import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.', // Set the root to the project directory
  publicDir: 'public', // Ensure public assets are copied
  build: {
    outDir: 'dist', // Adjust the output directory
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html') // Ensure Vite uses the correct index.html
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src') // Add an alias for the src directory
    }
  },
  assetsInclude: ['**/*.png', '**/*.svg', '**/*.jpg', '**/*.jpeg', '**/*.gif'] // Include image assets
});