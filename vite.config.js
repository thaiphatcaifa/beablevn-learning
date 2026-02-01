import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Be Able VN Learning',
        short_name: 'BAVN App',
        description: 'Hệ thống quản lý đào tạo Be Able VN',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/BA LOGO.png', // Sử dụng logo hiện có của bạn
            sizes: '192x192',    // Lưu ý: Tốt nhất nên resize ảnh này về đúng 192x192
            type: 'image/png'
          },
          {
            src: '/BA LOGO.png',
            sizes: '512x512',    // Lưu ý: Tốt nhất nên resize ảnh này về đúng 512x512
            type: 'image/png'
          },
          {
            src: '/BA LOGO.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})