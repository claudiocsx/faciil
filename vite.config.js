import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['**/*.{svg,png,jpg,jpeg,gif,ico}'],
      manifest: {
        name: 'Faciil - Loja de Tecnologia',
        short_name: 'Faciil',
        description: 'Acessórios de tecnologia com entrega rápida via Uber Flash no Crato-CE.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FDFDFD',
        theme_color: '#FFB347',
        scope: '/',
        icons: [
          {
            src: '/pwa-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/pwa-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/Gemini_Generated_Image_mtu7qwmtu7qwmtu7.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['shopping'],
        lang: 'pt-BR',
        dir: 'ltr',
        prefer_related_applications: false,
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,gif,ico,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-data',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
})
