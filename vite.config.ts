import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,gif,webmanifest}'],
      runtimeCaching: [
        {
          urlPattern: ({ url }) => url.origin === self.location.origin,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'app-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7,
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
    manifest: {
      name: 'Shape Shift',
      short_name: 'ShapeShift',
      description: 'Your personal AI assistant',
      theme_color: '#1a1a1a',
      background_color: '#1a1a1a',
      display: 'standalone',
      start_url: '/',
      id: '/',
      icons: [
        {
          src: '/assets/android/android-launchericon-48-48.png',
          sizes: '48x48',
          type: 'image/png',
        },
        {
          src: '/assets/android/android-launchericon-72-72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: '/assets/android/android-launchericon-96-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: '/assets/android/android-launchericon-144-144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: '/assets/android/android-launchericon-192-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/assets/android/android-launchericon-512-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      screenshots: [
        {
          src: '/assets/X_large_image.png',
          sizes: '1280x800', // Example wide size, adjust as needed
          type: 'image/png',
          form_factor: 'wide',
          label: 'Shape Shift Desktop Screenshot',
        },
        {
          src: '/assets/android/android-launchericon-512-512.png',
          sizes: '512x512', // Example narrow size, adjust as needed
          type: 'image/png',
          form_factor: 'narrow',
          label: 'Shape Shift Mobile Screenshot',
        },
      ],
    },
    devOptions: {
      enabled: true
    }
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    middleware: (app) => {
      app.use('/sw.js', (req, res, next) => {
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(path.resolve(__dirname, 'dist/sw.js'));
      });
    }
  },
  build: {
    chunkSizeWarningLimit: 1500,
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
});