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
      theme_color: '#ffffff',
      icons: [
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
