import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https?:\/\/backend-production-1fae9\.up\.railway\.app\/api\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
      },
      includeAssets: ['logo.png', 'icons/*.png'],
      manifest: {
        name: 'En lo de Apu',
        short_name: 'En lo de Apu',
        description: 'Sistema de gestión para En lo de Apu',
        start_url: '/',
        scope: '/',
        theme_color: '#1e40af',
        background_color: '#1e40af',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'es-PY',
        categories: ['business', 'productivity'],
        icons: [
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ],
        splash_pages: null
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true
      },
      '/socket.io': {
        target: 'http://localhost:5001',
        ws: true
      }
    }
  }
})
