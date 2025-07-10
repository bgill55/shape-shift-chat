
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Shape Shift',
        short_name: 'ShapeShift',
        description: 'An AI-powered chat application.',
        theme_color: '#36393f',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'assets/android/android-launchericon-192-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'assets/android/android-launchericon-512-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: 'assets/ios/180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: 'assets/ios/167.png',
            sizes: '167x167',
            type: 'image/png',
          },
          {
            src: 'assets/ios/152.png',
            sizes: '152x152',
            type: 'image/png',
          },
        ],
      },
    }),
    mode === 'development' 
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: false,
  },
  build: {
    chunkSizeWarningLimit: 1000, // Set a higher limit to suppress the warning
  },
}));
