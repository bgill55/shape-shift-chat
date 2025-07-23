import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    manifest: {
      name: 'Shape Shift',
      short_name: 'ShapeShift',
      description: 'Your personal AI assistant',
      theme_color: '#1a1a1a',
      background_color: '#1a1a1a',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: 'android-launchericon-48-48.png',
          sizes: '48x48',
          type: 'image/png',
        },
        {
          src: 'android-launchericon-72-72.png',
          sizes: '72x72',
          type: 'image/png',
        },
        {
          src: 'android-launchericon-96-96.png',
          sizes: '96x96',
          type: 'image/png',
        },
        {
          src: 'android-launchericon-144-144.png',
          sizes: '144x144',
          type: 'image/png',
        },
        {
          src: 'android-launchericon-192-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'android-launchericon-512-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
  })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  build: {
    chunkSizeWarningLimit: 1500,
  }
})
